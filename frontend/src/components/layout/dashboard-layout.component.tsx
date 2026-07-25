import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { StudentAdmissionModal } from '../../pages/students/student-admission.modal';
import { CashierCounterModal } from '../../pages/finance/cashier-counter.modal';
import { GlobalSearchModal } from '../common/global-search.modal';

export const DashboardLayoutComponent: React.FC = () => {
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isCashierOpen, setIsCashierOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global F1, F2, and Ctrl+K Hotkey Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsAdmissionOpen(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setIsCashierOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
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
          onSearchOpen={() => setIsSearchOpen(true)}
          onQuickAdmission={() => setIsAdmissionOpen(true)}
          onQuickCashier={() => setIsCashierOpen(true)}
        />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Search Command Palette (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onQuickAdmission={() => setIsAdmissionOpen(true)}
        onQuickCashier={() => setIsCashierOpen(true)}
      />

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
