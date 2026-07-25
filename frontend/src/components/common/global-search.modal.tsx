import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Search,
  User,
  UserCheck,
  UserPlus,
  Receipt,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  FileSpreadsheet,
  X,
  Loader2,
  ChevronRight,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickAdmission?: () => void;
  onQuickCashier?: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onQuickAdmission,
  onQuickCashier,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Reset search term when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Search Students API
  const { data: studentsResponse, isLoading: loadingStudents } = useQuery({
    queryKey: ['global-search-students', searchTerm],
    queryFn: () => api.get(`/students?search=${encodeURIComponent(searchTerm)}&limit=5`),
    enabled: isOpen && searchTerm.trim().length >= 2,
  });

  // Search Teachers API
  const { data: teachersResponse, isLoading: loadingTeachers } = useQuery({
    queryKey: ['global-search-teachers', searchTerm],
    queryFn: () => api.get(`/teachers?search=${encodeURIComponent(searchTerm)}&limit=5`),
    enabled: isOpen && searchTerm.trim().length >= 2,
  });

  if (!isOpen) return null;

  const rawStudents = (studentsResponse as any)?.data;
  const students: any[] = Array.isArray(rawStudents) ? rawStudents : rawStudents?.items || [];

  const rawTeachers = (teachersResponse as any)?.data;
  const teachers: any[] = Array.isArray(rawTeachers) ? rawTeachers : rawTeachers?.items || [];

  // System Quick Actions
  const quickActions = [
    {
      title: 'New Student Admission (F1)',
      icon: UserPlus,
      color: 'text-primary',
      action: () => {
        onClose();
        if (onQuickAdmission) onQuickAdmission();
      },
    },
    {
      title: 'Cashier Billing Counter (F2)',
      icon: Receipt,
      color: 'text-emerald-600',
      action: () => {
        onClose();
        if (onQuickCashier) onQuickCashier();
      },
    },
    {
      title: 'Executive Summary Dashboard',
      icon: LayoutDashboard,
      color: 'text-sky-600',
      action: () => {
        onClose();
        navigate('/dashboard');
      },
    },
    {
      title: 'Student Roster Management',
      icon: User,
      color: 'text-primary',
      action: () => {
        onClose();
        navigate('/students');
      },
    },
    {
      title: 'Teacher Directory & Earnings',
      icon: UserCheck,
      color: 'text-indigo-600',
      action: () => {
        onClose();
        navigate('/teachers');
      },
    },
    {
      title: 'Academic Year & Class Batches',
      icon: Calendar,
      color: 'text-amber-600',
      action: () => {
        onClose();
        navigate('/academic');
      },
    },
    {
      title: 'Rapid Attendance Marking',
      icon: CheckSquare,
      color: 'text-rose-600',
      action: () => {
        onClose();
        navigate('/attendance');
      },
    },
    {
      title: 'Monthly Invoice Center',
      icon: Receipt,
      color: 'text-emerald-600',
      action: () => {
        onClose();
        navigate('/finance');
      },
    },
    {
      title: 'Reports & Analytics Center',
      icon: FileSpreadsheet,
      color: 'text-purple-600',
      action: () => {
        onClose();
        navigate('/reports');
      },
    },
  ];

  const filteredActions = searchTerm.trim()
    ? quickActions.filter((a) => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : quickActions.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar Header */}
        <div className="p-4 border-b border-border flex items-center space-x-3 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type student name/code, teacher, or quick action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground text-foreground font-medium"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm('')}
              className="h-6 w-6 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground uppercase shrink-0">
            Esc to close
          </Badge>
        </div>

        {/* Search Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {(loadingStudents || loadingTeachers) && (
            <div className="flex items-center justify-center py-6 text-xs text-muted-foreground space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Searching database records...</span>
            </div>
          )}

          {/* Section A: Matched Students */}
          {searchTerm.trim().length >= 2 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                <span>Students ({students.length})</span>
                <span className="text-[10px] text-primary">Student 360 Profiles</span>
              </div>
              {students.length > 0 ? (
                <div className="space-y-1">
                  {students.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => {
                        onClose();
                        navigate(`/students/${st.id}`);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {st.fullName?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground flex items-center space-x-2">
                            <span>{st.fullName}</span>
                            <Badge variant="outline" className="font-mono text-[10px] border-primary text-primary">
                              {st.studentCode}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Guardian: {st.guardianMobile || 'N/A'} • Status: <span className="font-semibold text-emerald-600">{st.status}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                !loadingStudents && (
                  <div className="text-xs text-muted-foreground py-2 px-1">
                    No matching student records found.
                  </div>
                )
              )}
            </div>
          )}

          {/* Section B: Matched Teachers */}
          {searchTerm.trim().length >= 2 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Teachers ({teachers.length})
              </div>
              {teachers.length > 0 ? (
                <div className="space-y-1">
                  {teachers.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        onClose();
                        navigate('/teachers');
                      }}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {t.fullName?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground flex items-center space-x-2">
                            <span>{t.fullName}</span>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {t.teacherCode}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Commission: {t.defaultTuitionCommissionPct}% • Mobile: {t.mobileNumber}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                !loadingTeachers && (
                  <div className="text-xs text-muted-foreground py-2 px-1">
                    No matching teacher records found.
                  </div>
                )
              )}
            </div>
          )}

          {/* Section C: Quick Actions & Navigation */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Quick Actions & Navigation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {filteredActions.map((qa, index) => {
                const IconComponent = qa.icon;
                return (
                  <div
                    key={index}
                    onClick={qa.action}
                    className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-accent cursor-pointer border border-transparent hover:border-border transition-all"
                  >
                    <div className={`p-1.5 rounded-md bg-muted ${qa.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{qa.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Search Sector Panadura Institute Database</span>
          <span>Shortcut: <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-foreground font-mono">Ctrl + K</kbd></span>
        </div>
      </div>
    </div>
  );
};
