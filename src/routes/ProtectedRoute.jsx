import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>; // TODO: Replace with proper loading spinner
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // user.role from backend is uppercase (PATIENT, DOCTOR, ADMIN)
    if (user) {
        console.log(`ProtectedRoute: User=${user.email}, Role=${user.role}, Allowed=${allowedRoles}`);
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they try to access unauthorized area
        const dashboardMap = {
            PATIENT: '/patient/search', // Default landing for patient
            DOCTOR: '/doctor/schedule',
            ADMIN: '/admin/doctors' // Default landing for admin
        };
        return <Navigate to={dashboardMap[user.role] || '/'} replace />;
    }

    return children;
};
