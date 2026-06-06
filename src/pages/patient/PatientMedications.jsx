import { useState, useEffect } from 'react';
import { patientDashboardService } from '../../api/dataService';
import DataTable from '../../components/shared/DataTable';
import Card from '../../components/shared/Card';

const PatientMedications = () => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        patientDashboardService.getMedications()
            .then(setMedications)
            .catch(() => setError('Failed to load medications.'))
            .finally(() => setLoading(false));
    }, []);

    const columns = [
        { header: 'Medication', accessor: 'medication_name' },
        { header: 'Dosage',     accessor: 'dosage'          },
        { header: 'Duration',   accessor: 'duration'        },
        {
            header: 'Diagnosis',
            render: row => (
                <span title={row.diagnosis} style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.diagnosis || '—'}
                </span>
            )
        },
        { header: 'Doctor',     accessor: 'doctor_name'    },
        {
            header: 'Date',
            render: row => new Date(row.appointment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        },
    ];

    if (loading) return <div style={{ padding: '2rem' }}>Loading medications...</div>;
    if (error)   return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>My Medications</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    All medications prescribed to you.
                </p>
            </div>
            <Card title={`All Medications (${medications.length})`}>
                {medications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No medications found.
                    </div>
                ) : (
                    <DataTable columns={columns} data={medications} />
                )}
            </Card>
        </div>
    );
};

export default PatientMedications;
