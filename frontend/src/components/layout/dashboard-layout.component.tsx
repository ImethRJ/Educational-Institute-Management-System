import React from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

interface DashboardLayoutProps {
  onQuickAdmission?: () => void;
  onQuickCashier?: () => void;
}

export const DashboardLayoutComponent: React.FC<DashboardLayoutProps> = ({
  onQuickAdmission,
  onQuickCashier,
}) => {
  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* Collapsible Sidebar */}
      <SidebarComponent />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <HeaderComponent
          onQuickAdmission={onQuickAdmission}
          onQuickCashier={onQuickCashier}
        />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
