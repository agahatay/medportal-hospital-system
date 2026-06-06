import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Building2,
    Settings,
    LogOut,
    User,
    Clock,
    FileText,
    ClipboardList,
    CreditCard,
    Pill,
    Scan
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const getLinks = (role) => {
        switch (role) {
            case 'DOCTOR':
                return [
                    { name: 'Schedule',        path: '/doctor/schedule',        icon: <Calendar size={20} /> },
                    { name: 'Appointments',    path: '/doctor/appointments',    icon: <Users size={20} /> },
                    { name: 'Work Hours',      path: '/doctor/work-hours',      icon: <Clock size={20} /> },
                    { name: 'Medical Records',     path: '/doctor/medical-records',     icon: <FileText size={20} /> },
                    { name: 'Prescriptions',       path: '/doctor/prescriptions',       icon: <ClipboardList size={20} /> },
                    { name: 'Medications',         path: '/doctor/medications',         icon: <Pill size={20} /> },
                    { name: 'Billing',             path: '/doctor/billing',             icon: <CreditCard size={20} /> },
                    { name: 'Radiological Results',path: '/doctor/radiological-results',icon: <Scan size={20} /> },
                    { name: 'Profile',             path: '/doctor/profile',             icon: <Settings size={20} /> },
                ];
            case 'ADMIN':
                return [
                    { name: 'Overview',         path: '/admin/overview',      icon: <LayoutDashboard size={20} /> },
                    { name: 'Doctors',          path: '/admin/doctors',       icon: <User size={20} /> },
                    { name: 'Departments',      path: '/admin/departments',   icon: <Building2 size={20} /> },
                    { name: 'All Appointments', path: '/admin/appointments',  icon: <Calendar size={20} /> },
                    { name: 'Billing',          path: '/admin/billing',       icon: <CreditCard size={20} /> },
                ];
            default:
                return [];
        }
    };

    const links = getLinks(user?.role);

    return (
        <aside className="sidebar" style={{
            width: '260px',
            backgroundColor: 'var(--bg-sidebar)',
            color: 'white',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--spacing-md)',
            overflowY: 'auto'
        }}>
            <div className="logo" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: '8px' }}></div>
                <span>MedPortal</span>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.65rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            color: isActive ? 'white' : '#9CA3AF',
                            backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            fontSize: '0.925rem'
                        })}
                    >
                        {link.icon}
                        <span>{link.name}</span>
                    </NavLink>
                ))}
            </nav>

            <button
                onClick={logout}
                style={{
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    width: '100%',
                    textAlign: 'left',
                    flexShrink: 0
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <LogOut size={20} />
                <span>Logout</span>
            </button>
        </aside>
    );
};

export default Sidebar;
