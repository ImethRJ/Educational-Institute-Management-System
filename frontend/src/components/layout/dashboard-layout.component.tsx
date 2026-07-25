import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { StudentAdmissionModal } from '../../pages/students/student-admission.modal';
import { CashierCounterModal } from '../../pages/finance/cashier-counter.modal';

export const DashboardLayoutComponent: React.FC = () => {
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isCashierOpen, setIsCashierOpen] = useState(false);

  // Global F1 & F2 Hotkey Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsAdmissionOpen(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setIsCashierOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* Collapsible Sidebar */}
      <SidebarComponent />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <HeaderComponent
          onQuickAdmission={() => setIsAdmissionOpen(true)}
          onQuickCashier={() => setIsCashierOpen(true)}
        />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Quick Action Modals Triggered by Top Buttons & F1 / F2 Keyboard Shortcuts */}
      <StudentAdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
      />

      <CashierCounterModal
        isOpen={isCashierOpen}
        onClose={() => setIsCashierOpen(false)}
      />
    </div>
  );
};
