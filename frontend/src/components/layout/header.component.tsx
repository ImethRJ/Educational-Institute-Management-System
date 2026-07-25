import React from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Menu, Sun, Moon, Search, LogOut, User, Zap } from 'lucide-react';

interface HeaderProps {
  onSearchOpen?: () => void;
  onQuickAdmission?: () => void;
  onQuickCashier?: () => void;
}

export const HeaderComponent: React.FC<HeaderProps> = ({
  onSearchOpen,
  onQuickAdmission,
  onQuickCashier,
}) => {
  const { admin, logout } = useAuthStore();
  const { theme, toggleTheme, toggleSidebar } = useUIStore();

  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} title="Toggle Sidebar">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Global Quick Search Bar (Command Palette Trigger) */}
        <button
          type="button"
          onClick={onSearchOpen}
          className="relative w-64 md:w-80 h-9 px-3 pl-9 rounded-md border border-input bg-background text-xs text-muted-foreground flex items-center justify-between hover:border-primary/50 transition-colors shadow-sm cursor-pointer"
        >
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <span>Search student, teacher...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded text-muted-foreground">
            Ctrl + K
          </kbd>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        {/* Quick Actions Hotkeys */}
        <div className="hidden lg:flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onQuickAdmission}
            className="text-xs font-semibold border-primary/20 text-primary hover:bg-primary/5"
          >
            <Zap className="h-3.5 w-3.5 mr-1 text-amber-500" />
            Admission (F1)
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onQuickCashier}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Cashier Counter (F2)
          </Button>
        </div>

        {/* Dark/Light Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Admin Avatar Profile Menu */}
        <div className="flex items-center space-x-2 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
            {admin?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold">{admin?.fullName || 'Administrator'}</div>
            <div className="text-[10px] text-muted-foreground">Main Branch</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Log Out"
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
