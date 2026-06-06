import { useState, useEffect } from 'react';
import { doctorDashboardService } from '../../api/dataService';
import DataTable from '../../components/shared/DataTable';
import Card from '../../components/shared/Card';

const DoctorPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);

    useEffect(() => {
        doctorDashboardService.getPrescriptions()
            .then(setPrescriptions)
            .catch(() => setError('Failed to load prescriptions.'))
            .finally(() => setLoading(false));
    }, []);

    const columns = [
        { header: 'Patient',    accessor: 'patient_name' },
        {
            header: 'Appt. Date',
            render: row => new Date(row.appointment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        },
        {
            header: 'Diagnosis',
            render: row => (
                <span title={row.diagnosis} style={{ maxWidth: 220, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.diagnosis || '—'}
                </span>
            )
        },
        { header: 'Medication', accessor: 'medication_name' },
        { header: 'Dosage',     render: row => row.dosage || '—' },
        { header: 'Duration',   render: row => row.prescription_duration || '—' }
    ];

    if (loading) return <div style={{ padding: '2rem' }}>Loading prescriptions...</div>;
    if (error)   return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Prescriptions</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Medications prescribed through your medical records.
                </p>
            </div>

            <Card title={`All Prescriptions (${prescriptions.length})`}>
                {prescriptions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No prescriptions found.
                    </div>
                ) : (
                    <DataTable columns={columns} data={prescriptions} />
                )}
            </Card>
        </div>
    );
};

export default DoctorPrescriptions;
