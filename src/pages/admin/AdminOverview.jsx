import { useState, useEffect } from 'react';
import { adminService } from '../../api/dataService';
import Card from '../../components/shared/Card';
import { Users, Calendar, Building2, TrendingUp, Clock, Star } from 'lucide-react';

const StatCard = ({ icon, iconBg, iconColor, value, label }) => (
    <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: iconBg, borderRadius: 'var(--radius-md)', color: iconColor, flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</div>
            </div>
        </div>
    </Card>
);

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalPatients: 0,
        totalDepartments: 0,
        totalAppointments: 0,
        appointmentsToday: 0,
        mostBookedDepartment: 'N/A',
        statusBreakdown: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch admin stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Dashboard Overview</h1>

            {/* Row 1 — core counts */}
            <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
                <StatCard
                    icon={<Users size={24} />}
                    iconBg="#DBEAFE" iconColor="#1E40AF"
                    value={stats.totalDoctors}
                    label="Total Doctors"
                />
                <StatCard
                    icon={<Users size={24} />}
                    iconBg="#DCFCE7" iconColor="#166534"
                    value={stats.totalPatients}
                    label="Total Patients"
                />
                <StatCard
                    icon={<Building2 size={24} />}
                    iconBg="#FEF3C7" iconColor="#92400E"
                    value={stats.totalDepartments}
                    label="Departments"
                />
            </div>

            {/* Row 2 — appointment counts */}
            <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
                <StatCard
                    icon={<Calendar size={24} />}
                    iconBg="#EDE9FE" iconColor="#5B21B6"
                    value={stats.totalAppointments}
                    label="Total Appointments"
                />
                <StatCard
                    icon={<Clock size={24} />}
                    iconBg="#FEE2E2" iconColor="#991B1B"
                    value={stats.appointmentsToday}
                    label="Appointments Today"
                />
                <StatCard
                    icon={<Star size={24} />}
                    iconBg="#D1FAE5" iconColor="#065F46"
                    value={stats.mostBookedDepartment}
                    label="Most Booked Dept."
                />
            </div>

            {/* Row 3 — status breakdown + system info */}
            <div className="grid-cols-2">
                <Card title="Appointment Status Breakdown">
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        {[
                            { key: 'Scheduled',  color: '#2563EB', label: 'Scheduled' },
                            { key: 'Completed',  color: '#059669', label: 'Completed' },
                            { key: 'Cancelled',  color: '#DC2626', label: 'Cancelled' },
                            { key: 'No_Show',    color: '#D97706', label: 'No Show' },
                        ].map(({ key, color, label }) => (
                            <div key={key}>
                                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color }}>
                                    {stats.statusBreakdown?.[key] || 0}
                                </span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="System Status">
                    <p style={{ color: 'var(--secondary)', fontWeight: 500 }}>All Systems Operational</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Server Uptime: 99.9%
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default AdminOverview;
