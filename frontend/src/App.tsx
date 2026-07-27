import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { useAuthStore } from './store/auth.store';
import { LoginPage } from './pages/login.page';
import { DashboardLayoutComponent } from './components/layout/dashboard-layout.component';
import { Toaster } from 'sonner';

const DashboardPage = React.lazy(() =>
  import('./pages/dashboard.page').then((m) => ({ default: m.DashboardPage })),
);
const StudentListPage = React.lazy(() =>
  import('./pages/students/student-list.page').then((m) => ({ default: m.StudentListPage })),
);
const StudentProfilePage = React.lazy(() =>
  import('./pages/students/student-profile.page').then((m) => ({ default: m.StudentProfilePage })),
);
const TeacherListPage = React.lazy(() =>
  import('./pages/teachers/teacher-list.page').then((m) => ({ default: m.TeacherListPage })),
);
const TimetablePage = React.lazy(() =>
  import('./pages/academic/timetable.page').then((m) => ({ default: m.TimetablePage })),
);
const RapidAttendancePage = React.lazy(() =>
  import('./pages/attendance/rapid-attendance.page').then((m) => ({ default: m.RapidAttendancePage })),
);
const AttendanceSummaryPage = React.lazy(() =>
  import('./pages/attendance/attendance-summary.page').then((m) => ({ default: m.AttendanceSummaryPage })),
);
const InvoiceCenterPage = React.lazy(() =>
  import('./pages/finance/invoice-center.page').then((m) => ({ default: m.InvoiceCenterPage })),
);
const ReportsCenterPage = React.lazy(() =>
  import('./pages/reports/reports-center.page').then((m) => ({ default: m.ReportsCenterPage })),
);
const SystemSettingsPage = React.lazy(() =>
  import('./pages/settings/system-settings.page').then((m) => ({ default: m.SystemSettingsPage })),
);

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
};

