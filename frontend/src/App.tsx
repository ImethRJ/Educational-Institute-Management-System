import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { useAuthStore } from './store/auth.store';
import { LoginPage } from './pages/login.page';
import { DashboardLayoutComponent } from './components/layout/dashboard-layout.component';
import { Toaster } from 'sonner';

// Placeholder route component until subsequent modules
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    <div className="p-8 border border-dashed border-border rounded-lg text-center text-muted-foreground text-sm">
      Module content loading in next step.
    </div>
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
            <Route path="dashboard" element={<PlaceholderPage title="Executive Summary Dashboard" />} />
            <Route path="students/*" element={<PlaceholderPage title="Student Management" />} />
            <Route path="teachers/*" element={<PlaceholderPage title="Teacher Management" />} />
            <Route path="academic/*" element={<PlaceholderPage title="Academic & Timetable Management" />} />
            <Route path="attendance/*" element={<PlaceholderPage title="Attendance Management" />} />
            <Route path="finance/*" element={<PlaceholderPage title="Finance & Fee Management" />} />
            <Route path="reports/*" element={<PlaceholderPage title="Reports & Analytics Center" />} />
            <Route path="settings/*" element={<PlaceholderPage title="System Settings & Audit Trail" />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
};
