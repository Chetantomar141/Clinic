import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';

// Public pages
import Home from './pages/public/Home';
import AboutClinic from './pages/public/AboutClinic';
import DoctorProfile from './pages/public/DoctorProfile';
import TreatmentsServices from './pages/public/TreatmentsServices';
import Contact from './pages/public/Contact';
import Verify from './pages/public/Verify';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard pages
import Overview from './pages/dashboard/Overview';
import Clinics from './pages/dashboard/Clinics';
import Doctors from './pages/dashboard/Doctors';
import Staff from './pages/dashboard/Staff';
import Patients from './pages/dashboard/Patients';
import Certificates from './pages/dashboard/Certificates';
import VerificationLogs from './pages/dashboard/VerificationLogs';
import AuditLogs from './pages/dashboard/AuditLogs';
import ClinicSettings from './pages/dashboard/Settings';

export default function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutClinic />} />
          <Route path="doctor" element={<DoctorProfile />} />
          <Route path="services" element={<TreatmentsServices />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route path="/verify" element={<Verify />} />
        <Route path="/verify/:certNo" element={<Verify />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Default redirect to overview */}
          <Route index element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="clinics" element={<Clinics />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="staff" element={<Staff />} />
          <Route path="patients" element={<Patients />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="verification-logs" element={<VerificationLogs />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<ClinicSettings />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
