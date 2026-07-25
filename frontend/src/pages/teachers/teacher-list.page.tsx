import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Teacher } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { TeacherCommissionModal } from './teacher-commission.modal';
import { TeacherFormModal } from './teacher-form.modal';
import { TeacherEarningsModal } from './teacher-earnings.modal';
import { toast } from 'sonner';
import { Search, UserCheck, Percent, UserPlus, Edit, Banknote, Trash2 } from 'lucide-react';

export const TeacherListPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [formTeacher, setFormTeacher] = useState<Teacher | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [commissionTeacher, setCommissionTeacher] = useState<Teacher | null>(null);
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);

  const [earningsTeacher, setEarningsTeacher] = useState<Teacher | null>(null);
  const [isEarningsOpen, setIsEarningsOpen] = useState(false);

  const { data: teachersResponse, isLoading } = useQuery({
    queryKey: ['teachers-list', search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      return api.get(`/teachers?${params.toString()}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/teachers/${id}`),
    onSuccess: () => {
      toast.success('Teacher deactivated successfully.');
      queryClient.invalidateQueries({ queryKey: ['teachers-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpi-summary'] });
    },
  });

  const rawTeachers = (teachersResponse as any)?.data;
  const teachers: Teacher[] = Array.isArray(rawTeachers) ? rawTeachers : rawTeachers?.items || [];

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teacher Directory & Financial Earnings</h1>
          <p className="text-xs text-muted-foreground">
            Full CRUD management of teacher profiles, commission rules, and linked student payment revenue splits
          </p>
        </div>
        <Button
          onClick={() => {
            setFormTeacher(null);
            setIsFormOpen(true);
          }}
          className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <UserPlus className="h-4 w-4 mr-1.5" /> Register New Teacher
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teacher by code, name, NIC, or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Data Grid Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher Code</TableHead>
                <TableHead>Teacher Name</TableHead>
                <TableHead>NIC / Passport</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Assigned Subjects</TableHead>
                <TableHead>Tuition Comm. %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions & Financials</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                    Loading teacher directory...
                  </TableCell>
                </TableRow>
              ) : teachers.length > 0 ? (
                teachers.map((tch) => (
                  <TableRow key={tch.id}>
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {tch.teacherCode}
                    </TableCell>
                    <TableCell className="font-semibold text-xs">{tch.fullName}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {tch.nicOrPassport}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{tch.mobileNumber}</TableCell>
                    <TableCell>
                      {tch.teacherSubjects && tch.teacherSubjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {tch.teacherSubjects.map((ts: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                              {ts.subject?.name || ts.subjectId}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">No subjects linked</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-bold text-xs border-emerald-600 text-emerald-600">
                        {Number(tch.defaultTuitionCommissionPct).toFixed(1)}% Share
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tch.status === 'ACTIVE' ? 'success' : 'destructive'} className="text-[10px]">
                        {tch.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Earnings & Payout Breakdown */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEarningsTeacher(tch);
                            setIsEarningsOpen(true);
                          }}
                          className="text-xs text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                          title="View Earnings Breakdown"
                        >
                          <Banknote className="h-3.5 w-3.5 mr-1" /> Earnings Log
                        </Button>

                        {/* Edit Teacher Profile */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFormTeacher(tch);
                            setIsFormOpen(true);
                          }}
                          title="Edit Teacher Profile"
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>

                        {/* Commission Rules */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCommissionTeacher(tch);
                            setIsCommissionOpen(true);
                          }}
                          title="Configure Commission Rules"
                        >
                          <Percent className="h-4 w-4 text-emerald-600" />
                        </Button>

                        {/* Deactivate Teacher */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Deactivate teacher ${tch.fullName}?`)) {
                              deleteMutation.mutate(tch.id);
                            }
                          }}
                          title="Deactivate Teacher"
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                    No teacher records found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Teacher Form Modal (Create / Edit) */}
      <TeacherFormModal
        teacher={formTeacher}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormTeacher(null);
        }}
      />

      {/* Commission Configuration Modal */}
      {commissionTeacher && (
        <TeacherCommissionModal
          teacher={commissionTeacher}
          isOpen={isCommissionOpen}
          onClose={() => {
            setIsCommissionOpen(false);
            setCommissionTeacher(null);
          }}
        />
      )}

      {/* Teacher Financial Earnings & Payout Breakdown Modal */}
      {earningsTeacher && (
        <TeacherEarningsModal
          teacher={earningsTeacher}
          isOpen={isEarningsOpen}
          onClose={() => {
            setIsEarningsOpen(false);
            setEarningsTeacher(null);
          }}
        />
      )}
    </div>
  );
};
