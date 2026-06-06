import { useState, useEffect } from 'react';
import { patientDashboardService } from '../../api/dataService';
import DataTable from '../../components/shared/DataTable';
import Card from '../../components/shared/Card';

const PatientPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        patientDashboardService.getPrescriptions()
            .then(setPrescriptions)
            .catch(() => setError('Failed to load prescriptions.'))
            .finally(() => setLoading(false));
    }, []);

    const columns = [
        {
            header: 'Appt. Date',
            render: row => new Date(row.appointment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        },
        { header: 'Doctor',     accessor: 'doctor_name'          },
        {
            header: 'Diagnosis',
            render: row => (
                <span title={row.diagnosis} style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.diagnosis || '—'}
                </span>
            )
        },
        { header: 'Medication', accessor: 'medication_name'      },
        { header: 'Dosage',     accessor: 'dosage'               },
        { header: 'Duration',   accessor: 'prescription_duration' },
    ];

    if (loading) return <div style={{ padding: '2rem' }}>Loading prescriptions...</div>;
    if (error)   return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>My Prescriptions</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Medications prescribed during your appointments.
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

export default PatientPrescriptions;
