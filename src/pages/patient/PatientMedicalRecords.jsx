import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { patientDashboardService } from '../../api/dataService';
import { generatePatientReportPdf } from '../../utils/pdfHelpers';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/shared/DataTable';
import Card from '../../components/shared/Card';
import { resolveRadiologyImage } from '../../assets/radiology/radiologyImageMap';

const PatientMedicalRecords = () => {
    const { user } = useAuth();
    const [records, setRecords]                     = useState([]);
    const [loading, setLoading]                     = useState(true);
    const [error, setError]                         = useState(null);
    const [downloadingReport, setDownloadingReport] = useState(false);

    useEffect(() => {
        patientDashboardService.getMedicalRecords()
            .then(setRecords)
            .catch(() => setError('Failed to load medical records.'))
            .finally(() => setLoading(false));
    }, []);

    const handleDownloadReport = async () => {
        if (downloadingReport) return;
        setDownloadingReport(true);
        try {
            const [prescriptions, radiologyRaw] = await Promise.all([
                patientDashboardService.getPrescriptions(),
                patientDashboardService.getRadiologicalResults(),
            ]);
            const radiology = radiologyRaw.map(r => ({
                ...r,
                image_url: resolveRadiologyImage(r) ?? r.image_url,
            }));

            await generatePatientReportPdf({
                patient: {
                    name:  user?.name  || user?.email || 'Patient',
                    email: user?.email,
                    id:    user?.id,
                },
                records,
                prescriptions,
                radiology,
                // billing is not exposed on the patient API — section is omitted
            });
        } catch (err) {
            console.error('PDF generation failed:', err);
        } finally {
            setDownloadingReport(false);
        }
    };

    const columns = [
        {
            header: 'Appt. Date',
            render: row => new Date(row.appointment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        },
        { header: 'Doctor',           accessor: 'doctor_name'           },
        { header: 'Specialization',   accessor: 'doctor_specialization' },
        {
            header: 'Diagnosis',
            render: row => (
                <span title={row.diagnosis} style={{ maxWidth: 220, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.diagnosis || '—'}
                </span>
            )
        },
        {
            header: 'Treatment',
            render: row => (
                <span title={row.treatment} style={{ maxWidth: 220, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.treatment || '—'}
                </span>
            )
        },
        {
            header: 'Record Date',
            render: row => row.record_date
                ? new Date(row.record_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—'
        }
    ];

    if (loading) return <div style={{ padding: '2rem' }}>Loading medical records...</div>;
    if (error)   return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>My Medical Records</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Diagnoses and treatment notes from your appointments.
                    </p>
                </div>
                <button
                    onClick={handleDownloadReport}
                    disabled={downloadingReport}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.2rem',
                        background: downloadingReport ? '#94A3B8' : 'var(--primary, #2563EB)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: downloadingReport ? 'default' : 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'background 0.15s',
                    }}
                >
                    <Download size={16}/>
                    {downloadingReport ? 'Generating…' : 'Download My Report'}
                </button>
            </div>

            <Card title={`All Records (${records.length})`}>
                {records.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No medical records found.
                    </div>
                ) : (
                    <DataTable columns={columns} data={records} />
                )}
            </Card>
        </div>
    );
};

export default PatientMedicalRecords;
