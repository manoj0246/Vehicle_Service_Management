import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BookServicePage } from './pages/customer/BookServicePage';
import { VehiclesPage } from './pages/customer/VehiclesPage';
import { AppointmentsPage } from './pages/customer/AppointmentsPage';
import { TechnicianDashboardPage } from './pages/technician/TechnicianDashboardPage';
import { TechnicianJobsPage } from './pages/technician/TechnicianJobsPage';
import { TechnicianSchedulePage } from './pages/technician/TechnicianSchedulePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminTechniciansPage } from './pages/admin/AdminTechniciansPage';
import { AdminCentersPage } from './pages/admin/AdminCentersPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/book"
                element={
                  <ProtectedRoute>
                    <BookServicePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicles"
                element={
                  <ProtectedRoute>
                    <VehiclesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <AppointmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technician/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Technician']}>
                    <TechnicianDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technician/jobs"
                element={
                  <ProtectedRoute allowedRoles={['Technician']}>
                    <TechnicianJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technician/schedule"
                element={
                  <ProtectedRoute allowedRoles={['Technician']}>
                    <TechnicianSchedulePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                    <AdminBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/technicians"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                    <AdminTechniciansPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/centers"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                    <AdminCentersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/services"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                    <AdminServicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['SuperAdmin']}>
                    <AdminAuditLogsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
