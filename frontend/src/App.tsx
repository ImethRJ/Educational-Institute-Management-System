import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { useAuthStore } from './store/auth.store';
import { LoginPage } from './pages/login.page';
import { DashboardLayoutComponent } from './components/layout/dashboard-layout.component';
import { Toaster } from 'sonner';

import { DashboardPage } from './pages/dashboard.page';
import { StudentListPage } from './pages/students/student-list.page';
import { StudentProfilePage } from './pages/students/student-profile.page';
import { TeacherListPage } from './pages/teachers/teacher-list.page';
import { TimetablePage } from './pages/academic/timetable.page';
import { RapidAttendancePage } from './pages/attendance/rapid-attendance.page';
import { AttendanceSummaryPage } from './pages/attendance/attendance-summary.page';
import { InvoiceCenterPage } from './pages/finance/invoice-center.page';
import { ReportsCenterPage } from './pages/reports/reports-center.page';
import { SystemSettingsPage } from './pages/settings/system-settings.page';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayoutComponent />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="students" element={<StudentListPage />} />
            <Route path="students/:id" element={<StudentProfilePage />} />
            <Route path="teachers" element={<TeacherListPage />} />
            <Route path="academic" element={<TimetablePage />} />
            <Route path="attendance" element={<RapidAttendancePage />} />
            <Route path="attendance/summary" element={<AttendanceSummaryPage />} />
            <Route path="finance" element={<InvoiceCenterPage />} />
            <Route path="reports" element={<ReportsCenterPage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
};

