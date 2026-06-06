import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import SimpleLayout from './components/layout/SimpleLayout';

// Pages - Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Pages - Patient
import DoctorSearch from './pages/patient/DoctorSearch';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import PatientProfile from './pages/patient/PatientProfile';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientMedications from './pages/patient/PatientMedications';
import PatientRadiologicalResults from './pages/patient/PatientRadiologicalResults';
import PatientBilling from './pages/patient/PatientBilling';

// Pages - Doctor
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorScheduleManager from './pages/doctor/DoctorScheduleManager';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorMedications from './pages/doctor/DoctorMedications';
import DoctorBilling from './pages/doctor/DoctorBilling';
import DoctorRadiologicalResults from './pages/doctor/DoctorRadiologicalResults';

// Pages - Admin
import AdminOverview from './pages/admin/AdminOverview';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminAllAppointments from './pages/admin/AdminAllAppointments';
import AdminBilling from './pages/admin/AdminBilling';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Catch all redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Patient Portal */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <SimpleLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="search" replace />} />
            <Route path="search" element={<DoctorSearch />} />
            <Route path="book/:doctorId" element={<BookAppointment />} />
            <Route path="my-appointments" element={<MyAppointments />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="medical-records" element={<PatientMedicalRecords />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="medications" element={<PatientMedications />} />
            <Route path="radiological-results" element={<PatientRadiologicalResults />} />
            <Route path="billing" element={<PatientBilling />} />
          </Route>

          {/* Doctor Portal */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="schedule" replace />} />
            <Route path="schedule"        element={<DoctorSchedule />} />
            <Route path="appointments"    element={<DoctorAppointments />} />
            <Route path="work-hours"      element={<DoctorScheduleManager />} />
            <Route path="medical-records"     element={<DoctorMedicalRecords />} />
            <Route path="prescriptions"       element={<DoctorPrescriptions />} />
            <Route path="medications"         element={<DoctorMedications />} />
            <Route path="billing"             element={<DoctorBilling />} />
            <Route path="radiological-results" element={<DoctorRadiologicalResults />} />
            <Route path="profile"         element={<DoctorProfile />} />
          </Route>

          {/* Admin Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="doctors" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="appointments" element={<AdminAllAppointments />} />
            <Route path="billing" element={<AdminBilling />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
