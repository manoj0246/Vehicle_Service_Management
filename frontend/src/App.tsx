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
                  <ProtectedRoute allowedRoles={['Technician', 'Admin', 'SuperAdmin']}>
                    <TechnicianDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technician/jobs"
                element={
                  <ProtectedRoute allowedRoles={['Technician', 'Admin', 'SuperAdmin']}>
                    <TechnicianJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technician/schedule"
                element={
                  <ProtectedRoute allowedRoles={['Technician', 'Admin', 'SuperAdmin']}>
                    <TechnicianSchedulePage />
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
