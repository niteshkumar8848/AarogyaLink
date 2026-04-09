import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLoadingSkeleton from './components/common/AppLoadingSkeleton';
import useAuth from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import PatientDoctorsPage from './pages/PatientDoctorsPage';
import PatientDoctorProfilePage from './pages/PatientDoctorProfilePage';
import PatientAppointmentsPage from './pages/PatientAppointmentsPage';
import PatientQueuePage from './pages/PatientQueuePage';
import PatientNotificationsPage from './pages/PatientNotificationsPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import DoctorQueuePage from './pages/DoctorQueuePage';
import DoctorSchedulePage from './pages/DoctorSchedulePage';
import DoctorPatientsPage from './pages/DoctorPatientsPage';
import DoctorEarningsPage from './pages/DoctorEarningsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminDoctorsPage from './pages/AdminDoctorsPage';
import AdminHospitalsPage from './pages/AdminHospitalsPage';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';
import AdminQueuesPage from './pages/AdminQueuesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';

const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <AppLoadingSkeleton title="Preparing your account..." />;
  if (!user) return <LandingPage />;
  if (user.role === 'patient') return <Navigate to="/patient/dashboard" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <LandingPage />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/doctors"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDoctorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/doctors/:id"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDoctorProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/queue/:appointmentId"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientQueuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/notifications"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientNotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/queue"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorQueuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/schedule"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorSchedulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorPatientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/earnings"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorEarningsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDoctorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hospitals"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminHospitalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/queues"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminQueuesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
      <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
      <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default App;
