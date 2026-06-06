import { useState, useEffect } from 'react';
import { doctorDashboardService } from '../../api/dataService';
import { appointmentService } from '../../api/dataService';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { Check, X, Clock } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DoctorSchedule = () => {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const fetchDashboard = async () => {
        try {
            const result = await doctorDashboardService.getDashboard();
            setData(result);
        } catch (err) {
            console.error(err);
            setError('Failed to load schedule.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const handleStatusUpdate = async (appointmentId, status) => {
        try {
            await appointmentService.updateStatus(appointmentId, status);
            fetchDashboard();
        } catch {
            alert('Failed to update status');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading schedule...</div>;
    if (error)   return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

    const { todayAppointments, upcomingAppointments, nextPatient, workHours, overview } = data;

    // Today's work hours
    const todayDayOfWeek = new Date().getDay();
    const todaySchedule  = workHours.find(s => s.day_of_week === todayDayOfWeek);
    const workHoursText  = todaySchedule
        ? `${todaySchedule.start_time.slice(0, 5)} – ${todaySchedule.end_time.slice(0, 5)}`
        : 'No schedule configured';

    const actionColumns = [
        {
            header: 'Time',
            render: row => new Date(row.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        { header: 'Patient', accessor: 'patient_name' },
        { header: 'Reason',  accessor: 'reason' },
        {
            header: 'Date',
            render: row => new Date(row.appointment_date).toLocaleDateString()
        },
        { header: 'Duration', render: row => row.duration ? `${row.duration} min` : '20 min' },
        {
            header: 'Status',
            render: row => <StatusBadge status={row.status} />
        },
        {
            header: 'Actions',
            render: row => row.status === 'Scheduled' ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        style={{ padding: '0.25rem 0.5rem', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); handleStatusUpdate(row.appointment_id, 'Completed'); }}
                    >
                        <Check size={16} />
                    </Button>
                    <Button
                        style={{ padding: '0.25rem 0.5rem', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); handleStatusUpdate(row.appointment_id, 'Cancelled'); }}
                    >
                        <X size={16} />
                    </Button>
                </div>
            ) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>—</span>
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Doctor's Schedule</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {DAY_NAMES[todayDayOfWeek]}'s overview — working hours: <strong>{workHoursText}</strong>
                </p>
            </div>

            {/* Overview + Next Patient */}
            <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
                <Card title="Today's Overview">
                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', textAlign: 'center', padding: '1rem 0' }}>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{overview.todayCount}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>Today's Patients</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)' }}>{overview.upcomingCount}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>Upcoming</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--secondary)' }}>{overview.completedTotal}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>Total Done</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <Clock size={15} />
                        <span>Today: {workHoursText}</span>
                    </div>
                </Card>

                <Card title="Next Patient">
                    {nextPatient ? (
                        <div style={{ padding: '1rem', background: '#F3F4F6', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontWeight: 600 }}>
                                    {new Date(nextPatient.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <StatusBadge status={nextPatient.status} />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{nextPatient.patient_name}</h3>
                            <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)' }}>{nextPatient.reason || 'No reason provided'}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Duration: {nextPatient.duration || 20} min
                            </p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                            No more scheduled patients today
                        </div>
                    )}
                </Card>
            </div>

            {/* Today's Schedule */}
            <Card title={`Today's Schedule (${todayAppointments.length})`}>
                {todayAppointments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No appointments today.</div>
                ) : (
                    <DataTable columns={actionColumns} data={todayAppointments} />
                )}
            </Card>

            {/* Upcoming */}
            <div style={{ marginTop: '2rem' }}>
                <Card title={`Upcoming Appointments (${upcomingAppointments.length})`}>
                    {upcomingAppointments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No upcoming appointments.</div>
                    ) : (
                        <DataTable columns={actionColumns} data={upcomingAppointments} />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default DoctorSchedule;
