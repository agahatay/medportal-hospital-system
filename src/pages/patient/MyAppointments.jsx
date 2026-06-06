import { useState, useEffect } from 'react';
import { appointmentService } from '../../api/dataService';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { X } from 'lucide-react';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const data = await appointmentService.getMyAppointments();
            setAppointments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await appointmentService.cancelAppointment(id);
            // Update status locally without refetching
            setAppointments(prev =>
                prev.map(a => a.appointment_id === id ? { ...a, status: 'Cancelled' } : a)
            );
        } catch (err) {
            alert(err.message || 'Failed to cancel appointment');
        }
    };

    // Split into upcoming and past
    const now = new Date();
    const upcoming = appointments.filter(a =>
        new Date(a.appointment_date) >= now && a.status === 'Scheduled'
    );
    const past = appointments.filter(a =>
        new Date(a.appointment_date) < now || a.status !== 'Scheduled'
    );

    const upcomingColumns = [
        {
            header: 'Date & Time',
            render: (row) => new Date(row.appointment_date).toLocaleString()
        },
        { header: 'Doctor',     accessor: 'doctor_name'     },
        { header: 'Department', accessor: 'department_name' },
        { header: 'Reason',     accessor: 'reason'          },
        {
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />
        },
        {
            header: 'Action',
            render: (row) => (
                <Button
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={(e) => { e.stopPropagation(); handleCancel(row.appointment_id); }}
                >
                    <X size={14} style={{ marginRight: '0.25rem' }} /> Cancel
                </Button>
            )
        }
    ];

    const pastColumns = [
        {
            header: 'Date & Time',
            render: (row) => new Date(row.appointment_date).toLocaleString()
        },
        { header: 'Doctor',     accessor: 'doctor_name'     },
        { header: 'Department', accessor: 'department_name' },
        {
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />
        }
    ];

    if (loading) return <div>Loading appointments...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>My Appointments</h1>

            <Card title="Upcoming Appointments" style={{ marginBottom: '1.5rem' }}>
                {upcoming.length > 0 ? (
                    <DataTable columns={upcomingColumns} data={upcoming} />
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No upcoming appointments.
                    </div>
                )}
            </Card>

            <Card title="Past & Cancelled Appointments">
                {past.length > 0 ? (
                    <DataTable columns={pastColumns} data={past} />
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No past appointments.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MyAppointments;
