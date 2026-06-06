import { jsPDF } from 'jspdf';

// ── Layout constants (all in mm, A4) ─────────────────────────────
const PW     = 210;
const PH     = 297;
const M      = 18;           // page margin
const CW     = PW - M * 2;  // content width  (174 mm)
const LH     = 5.4;          // standard line-height
const HDR_H  = 16;           // blue header bar height
const HDR_Y  = HDR_H + 10;  // first usable y after header

// ── Palette ───────────────────────────────────────────────────────
const BLUE    = [37,  99,  235];
const DARK    = [15,  23,  42];
const MID     = [71,  85,  105];
const MUTED   = [148, 163, 184];
const ROW_ALT = [248, 250, 252];
const DIVIDER = [226, 232, 240];

// ── Text helpers ──────────────────────────────────────────────────

// Converts any value to a PDF-safe string for jsPDF's built-in Helvetica.
// Helvetica uses WinAnsiEncoding; characters outside that range cause
// jsPDF to garble the ENTIRE string (e.g. "10 Apr" → "&1&0& &A&p&r").
// Turkish letters Ş Ğ İ ı and the lira sign ₺ are outside cp1252 /
// WinAnsiEncoding and are transliterated here.
export function safePdfText(value, fallback = '-') {
    if (value === null || value === undefined) return fallback;
    if (Array.isArray(value)) {
        const joined = value.map(v => safePdfText(v, '')).filter(Boolean).join(', ');
        return joined || fallback;
    }
    if (typeof value === 'object') return safePdfText(String(value), fallback);

    let s = String(value);

    // Turkish lira sign is outside Latin-1
    s = s.replace(/₺/g, 'TL');

    // Typographic punctuation: in Windows-1252 but NOT in PDF WinAnsiEncoding
    s = s.replace(/[—–]/g, '-');
    s = s.replace(/…/g, '...');
    s = s.replace(/[""]/g, '"');
    s = s.replace(/['']/g, "'");

    // Transliterate Turkish letters that fall outside cp1252.
    // (Ç Ü Ö ç ü ö ARE in cp1252 and render fine — leave them.)
    s = s.replace(/Ş/g, 'S').replace(/ş/g, 's');
    s = s.replace(/Ğ/g, 'G').replace(/ğ/g, 'g');
    s = s.replace(/İ/g, 'I').replace(/ı/g, 'i');

    // Strip any remaining characters outside Latin-1 (U+0100+)
    s = s.replace(/[^\x00-\xFF]/g, '');

    // Collapse any & artefacts or excess whitespace
    return s.replace(/&/g, ' ').replace(/\s+/g, ' ').trim() || fallback;
}

// Formats a monetary amount without the ₺ symbol (not in WinAnsiEncoding).
function fmtCurrency(amount) {
    const n = Number(amount);
    return isNaN(n) ? '-' : `TL ${n.toFixed(2)}`;
}

function fmtDate(d) {
    if (!d) return '-';
    const s = new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
    return s.replace(/\s+/g, ' ').trim();
}

function trunc(str, max) {
    const safe = safePdfText(str);
    if (!safe || safe === '-') return '-';
    return safe.length > max ? safe.slice(0, max - 1) + '...' : safe;
}

// ── Shared page chrome ────────────────────────────────────────────
function drawHeader(doc, subtitle) {
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, PW, HDR_H, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('MedPortal', M, 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(subtitle, PW - M, 11, { align: 'right' });
}

function drawFooter(doc, genAt) {
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.3);
    doc.line(M, PH - 12, PW - M, PH - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`Generated: ${genAt}`, M, PH - 7);
    doc.text('MedPortal - Confidential Medical Document', PW - M, PH - 7, { align: 'right' });
}

function sectionHead(doc, label, y) {
    doc.setFillColor(239, 246, 255);
    doc.rect(M, y, CW, 7.5, 'F');
    doc.setFillColor(...BLUE);
    doc.rect(M, y, 2.5, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BLUE);
    doc.text(label, M + 6, y + 5.2);
    return y + 11;
}

function kv(doc, key, value, x, y, keyW = 44) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...MID);
    doc.text(key, x, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    const safe  = safePdfText(value);
    const lines = doc.splitTextToSize(safe, CW - keyW - 2);
    doc.text(lines, x + keyW, y);
    return y + Math.max(1, lines.length) * LH;
}

// ── Image URL -> PNG data-URL (for embedding in PDF) ─────────────
// Handles SVG, PNG, JPEG. For SVG: renders via createImageBitmap so
// complex filters (feTurbulence, feGaussianBlur) are resolved by the
// browser compositor rather than a software canvas path.
async function imageToDataUrl(imageUrl) {
    if (!imageUrl) return null;
    try {
        const resp = await fetch(imageUrl);
        if (!resp.ok) return null;
        const blob = await resp.blob();

        if (!blob.type.includes('svg')) {
            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror   = reject;
                reader.readAsDataURL(blob);
            });
        }

        // SVG path: render via createImageBitmap → canvas → JPEG
        // JPEG avoids jsPDF 4.x's fast-png decoder which can fail on
        // certain canvas-generated RGBA PNGs in the browser build.
        const bitmap = await createImageBitmap(blob);
        const cv  = document.createElement('canvas');
        cv.width  = 640;
        cv.height = 320;
        const ctx = cv.getContext('2d');
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, 640, 320);
        ctx.drawImage(bitmap, 0, 0, 640, 320);
        bitmap.close();
        return cv.toDataURL('image/jpeg', 0.92);
    } catch {
        // Fallback for browsers where createImageBitmap rejects SVG blobs
        try {
            const resp2 = await fetch(imageUrl);
            if (!resp2.ok) return null;
            const blob2  = await resp2.blob();
            const objUrl = URL.createObjectURL(blob2);
            return await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const cv  = document.createElement('canvas');
                    cv.width  = 640;
                    cv.height = 320;
                    const ctx = cv.getContext('2d');
                    ctx.fillStyle = '#050510';
                    ctx.fillRect(0, 0, 640, 320);
                    ctx.drawImage(img, 0, 0, 640, 320);
                    URL.revokeObjectURL(objUrl);
                    try { resolve(cv.toDataURL('image/jpeg', 0.92)); }
                    catch { resolve(null); }
                };
                img.onerror = () => { URL.revokeObjectURL(objUrl); resolve(null); };
                img.src = objUrl;
            });
        } catch {
            return null;
        }
    }
}

// ── PART 1 ── Single Radiology Result ────────────────────────────
export async function generateRadiologyPdf(result, { patientName, doctorName }) {
    const doc   = new jsPDF({ unit: 'mm', format: 'a4' });
    const genAt = new Date().toLocaleString('en-GB').replace(/\s+/g, ' ');
    const SUB   = 'Radiological Result Report';

    drawHeader(doc, SUB);
    let y = HDR_Y;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...DARK);
    doc.text(SUB, M, y);
    y += 8;
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.5);
    doc.line(M, y, PW - M, y);
    y += 8;

    y = sectionHead(doc, 'Study Information', y);
    y = kv(doc, 'Patient',      safePdfText(patientName),           M, y);
    y = kv(doc, 'Doctor',       safePdfText(doctorName),            M, y);
    y = kv(doc, 'Imaging Type', result.image_type,                  M, y);
    y = kv(doc, 'Body Part',    result.body_part,                   M, y);
    y = kv(doc, 'Result Date',  fmtDate(result.result_date),        M, y);
    y = kv(doc, 'Appointment',  fmtDate(result.appointment_date),   M, y);
    y += 5;

    y = sectionHead(doc, 'Imaging Preview', y);

    const imgData = result.image_url ? await imageToDataUrl(result.image_url) : null;

    if (imgData) {
        const iw = 170, ih = 85;
        const ix = (PW - iw) / 2;
        doc.setFillColor(4, 4, 14);
        doc.roundedRect(ix - 2, y - 1, iw + 4, ih + 2, 2, 2, 'F');
        // Use JPEG format — avoids jsPDF 4.x fast-png decoder on canvas output
        doc.addImage(imgData, 'JPEG', ix, y, iw, ih);
        y += ih + 8;
    } else {
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(M, y, CW, 18, 2, 2, 'F');
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        doc.text('Image could not be loaded.', PW / 2, y + 10.5, { align: 'center' });
        y += 24;
    }

    y = sectionHead(doc, 'Clinical Findings', y);

    const findingText  = safePdfText(result.findings || 'No clinical findings recorded.');
    const findingLines = doc.splitTextToSize(findingText, CW - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 55, 75);

    let rem = [...findingLines];
    while (rem.length > 0) {
        const avail = Math.floor((PH - 22 - y) / LH);
        if (avail <= 0) {
            drawFooter(doc, genAt);
            doc.addPage();
            drawHeader(doc, SUB + ' (cont.)');
            y = HDR_Y;
        } else {
            const batch = rem.splice(0, avail);
            doc.text(batch, M + 2, y);
            y += batch.length * LH;
        }
    }

    drawFooter(doc, genAt);

    const fileSafe = s => (s ?? '').toString().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    doc.save(`radiology-${fileSafe(result.image_type)}-${fileSafe(patientName)}-${(result.result_date ?? '').slice(0, 10)}.pdf`);
}

// ── PART 2 ── Full Patient Report ─────────────────────────────────
// patient       : { name, email, id }
// records       : MedicalRecord[]
// prescriptions : Prescription[]
// radiology     : RadiologicalResult[]
// billing       : BillingRow[] | undefined  (undefined = skip section)
export async function generatePatientReportPdf({ patient, records, prescriptions, radiology, billing }) {
    const doc   = new jsPDF({ unit: 'mm', format: 'a4' });
    const genAt = new Date().toLocaleString('en-GB').replace(/\s+/g, ' ');
    const SUB   = 'Patient Medical Report';

    let y;
    let pageNum = 0;

    const newPage = () => {
        if (pageNum > 0) {
            drawFooter(doc, genAt);
            doc.addPage();
        }
        drawHeader(doc, SUB);
        pageNum++;
        y = HDR_Y;
    };

    const need = (mm) => { if (y + mm > PH - 20) newPage(); };

    newPage();

    // ── Report title ──────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(...DARK);
    doc.text(SUB, M, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(`Prepared for: ${safePdfText(patient.name || patient.email || '')}`, M, y);
    y += 8;
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.5);
    doc.line(M, y, PW - M, y);
    y += 7;

    // ── Patient Information ───────────────────────────────────────
    y = sectionHead(doc, 'Patient Information', y);
    y = kv(doc, 'Full Name',  patient.name,  M, y);
    if (patient.email) y = kv(doc, 'Email',      patient.email, M, y);
    if (patient.id)    y = kv(doc, 'Patient ID', `#${String(patient.id).padStart(4, '0')}`, M, y);
    y += 4;

    // ── Medical Records ───────────────────────────────────────────
    need(24);
    y = sectionHead(doc, `Medical Records  (${(records || []).length})`, y);

    const recs = records || [];
    if (!recs.length) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
        doc.text('No medical records found.', M + 4, y);
        y += 8;
    } else {
        for (let i = 0; i < recs.length; i++) {
            const rec       = recs[i];
            const diagText  = rec.diagnosis ? safePdfText(`Diagnosis: ${rec.diagnosis}`)  : '';
            const treatText = rec.treatment ? safePdfText(`Treatment: ${rec.treatment}`) : '';
            const diagLines  = doc.splitTextToSize(diagText,  CW - 10);
            const treatLines = doc.splitTextToSize(treatText, CW - 10);
            const rowH = 6 + (diagLines.length + treatLines.length) * 4.5 + 5;
            need(rowH + 4);

            if (i % 2 === 0) {
                doc.setFillColor(...ROW_ALT);
                doc.rect(M, y - 3, CW, rowH, 'F');
            }

            doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...DARK);
            const parts = [
                fmtDate(rec.appointment_date),
                rec.doctor_name  ? safePdfText(`Dr. ${rec.doctor_name}`)  : null,
                rec.patient_name ? safePdfText(rec.patient_name)          : null,
            ].filter(Boolean);
            doc.text(parts.join('  |  '), M + 3, y);
            y += 5.5;

            if (diagText) {
                doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(50, 65, 90);
                doc.text(diagLines, M + 5, y);
                y += diagLines.length * 4.5;
            }
            if (treatText) {
                doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(70, 82, 108);
                doc.text(treatLines, M + 5, y);
                y += treatLines.length * 4.5;
            }
            y += 4;
        }
    }
    y += 2;

    // ── Prescriptions ─────────────────────────────────────────────
    need(24);
    const rxs = prescriptions || [];
    y = sectionHead(doc, `Prescriptions  (${rxs.length})`, y);

    if (!rxs.length) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
        doc.text('No prescriptions found.', M + 4, y);
        y += 8;
    } else {
        const PC = [M + 2, M + 54, M + 90, M + 124];
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...MUTED);
        doc.text('Medication', PC[0], y);
        doc.text('Dosage',     PC[1], y);
        doc.text('Duration',   PC[2], y);
        doc.text('Date',       PC[3], y);
        y += 3.5;
        doc.setDrawColor(...DIVIDER); doc.setLineWidth(0.2);
        doc.line(M, y, PW - M, y);
        y += 3;

        for (let i = 0; i < rxs.length; i++) {
            need(7.5);
            const rx = rxs[i];
            if (i % 2 === 0) {
                doc.setFillColor(...ROW_ALT);
                doc.rect(M, y - 3.5, CW, 7, 'F');
            }
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...DARK);
            doc.text(trunc(rx.medication_name, 26),                                PC[0], y);
            doc.text(safePdfText(rx.dosage),                                       PC[1], y);
            doc.text(safePdfText(rx.prescription_duration || rx.duration),         PC[2], y);
            doc.text(fmtDate(rx.appointment_date || rx.record_date),               PC[3], y);
            y += 6;
        }
        y += 2;
    }

    // ── Radiological Studies ──────────────────────────────────────
    need(24);
    const rrList = radiology || [];
    y = sectionHead(doc, `Radiological Studies  (${rrList.length})`, y);

    if (!rrList.length) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
        doc.text('No radiological results found.', M + 4, y);
        y += 8;
    } else {
        for (let i = 0; i < rrList.length; i++) {
            const rr   = rrList[i];
            const snip = trunc(rr.findings || 'No findings recorded.', 220);
            const fLines = doc.splitTextToSize(snip, CW - 10);
            const rowH = 6 + fLines.length * 4.5 + 4;
            need(rowH + 4);

            if (i % 2 === 0) {
                doc.setFillColor(...ROW_ALT);
                doc.rect(M, y - 3, CW, rowH, 'F');
            }
            doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...DARK);
            doc.text(
                `${safePdfText(rr.image_type)}  -  ${safePdfText(rr.body_part)}  (${fmtDate(rr.result_date)})`,
                M + 3, y
            );
            y += 5.5;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(60, 75, 100);
            doc.text(fLines, M + 5, y);
            y += fLines.length * 4.5 + 4;
        }
    }
    y += 2;

    // ── Billing (doctor side only; patient side passes undefined) ──
    if (billing !== undefined) {
        need(24);
        const bills = billing || [];
        y = sectionHead(doc, `Billing  (${bills.length} records)`, y);

        if (!bills.length) {
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
            doc.text('No billing records found.', M + 4, y);
            y += 8;
        } else {
            const BC = [M + 2, M + 44, M + 84, M + 118];
            doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...MUTED);
            doc.text('Bill Date',  BC[0], y);
            doc.text('Amount',     BC[1], y);
            doc.text('Status',     BC[2], y);
            doc.text('Appt Date',  BC[3], y);
            y += 3.5;
            doc.setDrawColor(...DIVIDER); doc.setLineWidth(0.2);
            doc.line(M, y, PW - M, y);
            y += 3;

            let total = 0;
            for (let i = 0; i < bills.length; i++) {
                need(7.5);
                const b = bills[i];
                if (i % 2 === 0) {
                    doc.setFillColor(...ROW_ALT);
                    doc.rect(M, y - 3.5, CW, 7, 'F');
                }
                doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...DARK);
                doc.text(fmtDate(b.billing_date),            BC[0], y);
                doc.text(fmtCurrency(b.total_amount),        BC[1], y);
                doc.text(safePdfText(b.payment_status),      BC[2], y);
                doc.text(fmtDate(b.appointment_date),        BC[3], y);
                total += Number(b.total_amount) || 0;
                y += 6;
            }
            y += 3;
            doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...DARK);
            doc.text(`Total:  ${fmtCurrency(total)}`, PW - M, y, { align: 'right' });
            y += 5;
        }
    }

    drawFooter(doc, genAt);

    const fileSafe = s => (s ?? '').toString().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    doc.save(`patient-report-${fileSafe(patient.name || patient.email)}.pdf`);
}
