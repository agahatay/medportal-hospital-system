import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Calendar, Search, FileText, Pill, Syringe, ScanLine, CreditCard } from 'lucide-react';

const navLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 500,
    whiteSpace: 'nowrap'
};

const SimpleLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            {/* Top Navigation */}
            <nav style={{
                background: 'white',
                borderBottom: '1px solid var(--border-light)',
                padding: '0.75rem 0',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)' }}>
                        <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: '8px' }}></div>
                        <span>MedPortal</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <NavLink to="/patient/search"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                            style={navLinkStyle}>
                            <Search size={16} /> Find Doctor
                        </NavLink>
                        <NavLink to="/patient/my-appointments"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                            style={navLinkStyle}>
                            <Calendar size={16} /> Appointments
                        </NavLink>
                        <NavLink to="/patient/medical-records"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                            style={navLinkStyle}>
                            <FileText size={16} /> Records
                        </NavLink>
                        <NavLink to="/patient/prescriptions"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                            style={navLinkStyle}>
                            <Pill size={16} /> Prescriptions
                        </NavLink>
                        <NavLink to="/patient/medications"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                            style={navLinkStyle}>
                            <Syringe size={16} /> Medications
                        </NavLink>
                        <NavLink to="/patient/radiological-results"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                            style={navLinkStyle}>
                            <ScanLine size={16} /> Radiology
                        </NavLink>
                        <NavLink to="/patient/billing"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                            style={navLinkStyle}>
                            <CreditCard size={16} /> Billing
                        </NavLink>
                        <NavLink to="/patient/profile"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                            style={navLinkStyle}>
                            <User size={16} /> Profile
                        </NavLink>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.email}</span>
                        <button
                            onClick={handleLogout}
                            className="btn-outline"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container" style={{ padding: '2rem 1rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default SimpleLayout;
