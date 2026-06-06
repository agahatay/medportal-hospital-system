import { useState, useEffect } from 'react';
import { appointmentService } from '../../api/dataService';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Card from '../../components/shared/Card';

const AdminAllAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const data = await appointmentService.getAllAppointments();
                setAppointments(data); // Backend handles ordering
            } catch (err) {
                console.error(err);
                setError('Failed to fetch appointments');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const columns = [
        { header: 'ID', accessor: 'id' },
        {
            header: 'Date',
            render: (row) => new Date(row.appointment_date).toLocaleString()
        },
        { header: 'Doctor', accessor: 'doctor_name' },
        { header: 'Patient', accessor: 'patient_name' },
        {
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />
        }
    ];

    if (loading) return <div>Loading appointments...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>All Appointments</h1>
            <Card>
                <DataTable columns={columns} data={appointments} />
            </Card>
        </div>
    );
};

export default AdminAllAppointments;
