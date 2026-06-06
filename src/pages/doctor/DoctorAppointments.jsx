import { useState, useEffect } from 'react';
import { appointmentService } from '../../api/dataService';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Card from '../../components/shared/Card';

const DoctorAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await appointmentService.getMyAppointments();
                // Show all history sorted desc
                const sorted = data.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
                setAppointments(sorted);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [user]);

    const columns = [
        {
            header: 'Date',
            render: (row) => new Date(row.appointment_date).toLocaleString()
        },
        { header: 'Patient', accessor: 'patient_name' },
        { header: 'Reason', accessor: 'reason' },
        {
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />
        }
    ];

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>History & All Appointments</h1>
            <Card>
                <DataTable columns={columns} data={appointments} />
            </Card>
        </div>
    );
};

export default DoctorAppointments;
