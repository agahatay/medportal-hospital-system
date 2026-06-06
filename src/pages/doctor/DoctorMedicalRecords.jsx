import { useState, useEffect } from 'react';
import { Download, Search, X } from 'lucide-react';
import { doctorDashboardService } from '../../api/dataService';
import { generatePatientReportPdf } from '../../utils/pdfHelpers';
import DataTable from '../../components/shared/DataTable';
import Card from '../../components/shared/Card';

const DoctorMedicalRecords = () => {
    const [records, setRecords]               = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState(null);
    const [downloadingId, setDownloadingId]   = useState(null);
    const [search, setSearch]                 = useState('');

    // Client-side filter — backend already scopes records to this doctor via JWT.
    const query = search.trim().toLowerCase();
    const filteredRecords = query
        ? records.filter(r => r.patient_name?.toLowerCase().includes(query))
        : records;

    useEffect(() => {
        doctorDashboardService.getMedicalRecords()
            .then(setRecords)
            .catch(() => setError('Failed to load medical records.'))
            .finally(() => setLoading(false));
    }, []);

    // Fetches all doctor-scoped data and filters by patient_id before generating.
    // This preserves existing auth filtering — the doctor only ever sees their own patients.
    const handleDownloadPatientReport = async (patientId, patientName) => {
        if (downloadingId !== null) return;
        setDownloadingId(patientId);
        try {
            const [prescriptions, billing, radiology] = await Promise.all([
                doctorDashboardService.getPrescriptions(),
                doctorDashboardService.getBilling(),
                doctorDashboardService.getRadiologicalResults(),
            ]);

            await generatePatientReportPdf({
                patient: { name: patientName, id: patientId },
                records:       records.filter(r => r.patient_id === patientId),
                prescriptions: prescriptions.filter(r => r.patient_id === patientId),
                radiology:     radiology.filter(r => r.patient_id === patientId),
                billing:       billing.filter(r => r.patient_id === patientId),
            });
        } catch (err) {
            console.error('PDF generation failed:', err);
        } finally {
            setDownloadingId(null);
        }
    };

    const columns = [
        { header: 'Patient',     accessor: 'patient_name' },
        { header: 'Doctor',      accessor: 'doctor_name'  },
        {
            header: 'Appt. Date',
            render: row => new Date(row.appointment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        },
        {
            header: 'Diagnosis',
            render: row => (
                <span title={row.diagnosis} style={{ maxWidth: 240, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.diagnosis || '—'}
                </span>
            )
        },
        {
            header: 'Treatment',
            render: row => (
                <span title={row.treatment} style={{ maxWidth: 240, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.treatment || '—'}
                </span>
            )
        },
        {
            header: 'Record Date',
            render: row => row.record_date
                ? new Date(row.record_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—'
        },
        {
            header: 'Report',
            render: row => {
                const busy = downloadingId === row.patient_id;
                return (
                    <button
                        onClick={() => handleDownloadPatientReport(row.patient_id, row.patient_name)}
                        disabled={downloadingId !== null}
                        title={`Download full report for ${row.patient_name}`}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.28rem 0.65rem',
                            background: busy ? '#F1F5F9' : '#EFF6FF',
                            color: busy ? '#94A3B8' : '#2563EB',
                            border: '1px solid',
                            borderColor: busy ? '#CBD5E1' : '#BFDBFE',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: downloadingId !== null ? 'default' : 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'background 0.15s',
                        }}
                    >
                        <Download size={11}/>
                        {busy ? '…' : 'PDF'}
                    </button>
                );
            }
        },
    ];

    if (loading) return <div style={{ padding: '2rem' }}>Loading medical records...</div>;
    if (error)   return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

    const cardTitle = query
        ? `Showing ${filteredRecords.length} of ${records.length} records`
        : `All Records (${records.length})`;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Medical Records</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Patient diagnoses and treatment notes. Click <strong>PDF</strong> on any row to download that patient&apos;s full report.
                </p>
            </div>

            {/* Search bar */}
            <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: 380 }}>
                <Search
                    size={15}
                    style={{
                        position: 'absolute', left: '0.75rem', top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8', pointerEvents: 'none',
                    }}
                />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by patient name…"
                    style={{
                        width: '100%',
                        padding: '0.55rem 2.2rem 0.55rem 2.1rem',
                        border: '1px solid #E2E8F0',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#0F172A',
                        background: 'white',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#2563EB'; }}
                    onBlur={e =>  { e.target.style.borderColor = '#E2E8F0'; }}
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        title="Clear search"
                        style={{
                            position: 'absolute', right: '0.6rem', top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none', border: 'none',
                            cursor: 'pointer', padding: '0.2rem',
                            color: '#94A3B8', display: 'flex', alignItems: 'center',
                        }}
                    >
                        <X size={14}/>
                    </button>
                )}
            </div>

            <Card title={cardTitle}>
                {filteredRecords.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        {query
                            ? `No medical records found for "${search.trim()}".`
                            : 'No medical records found.'
                        }
                    </div>
                ) : (
                    <DataTable columns={columns} data={filteredRecords} />
                )}
            </Card>
        </div>
    );
};

export default DoctorMedicalRecords;
