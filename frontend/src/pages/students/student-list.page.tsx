import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Student, FeeCategory, StudentStatus } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { StudentAdmissionModal } from './student-admission.modal';
import { toast } from 'sonner';
import { Search, UserPlus, Download, Eye, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export const StudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [feeFilter, setFeeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);

  // Fetch paginated student list
  const { data: studentsResponse, isLoading } = useQuery({
    queryKey: ['students-list', search, statusFilter, feeFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (feeFilter) params.append('feeCategory', feeFilter);
      params.append('page', page.toString());
      params.append('limit', '15');
      return api.get(`/students?${params.toString()}`);
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/students/${id}`),
    onSuccess: () => {
      toast.success('Student status updated to INACTIVE.');
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
    },
  });

  const rawData = (studentsResponse as any)?.data;
  const students: Student[] = Array.isArray(rawData) ? rawData : rawData?.items || [];
  const meta = {
    page: rawData?.page || 1,
    totalPages: rawData?.totalPages || 1,
    totalItems: rawData?.total || students.length,
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Roster Directory</h1>
          <p className="text-xs text-muted-foreground">
            Manage student registrations, fee categories, and 360-degree academic profiles
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-4 w-4 mr-1.5" /> Export Roster
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAdmissionOpen(true)}
            className="text-xs font-semibold bg-primary hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> New Student Admission
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student ID, name, guardian mobile..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 text-xs"
              />
            </div>

            {/* Status Filter */}
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>

            {/* Fee Category Filter */}
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
              value={feeFilter}
              onChange={(e) => {
                setFeeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Fee Categories</option>
              <option value="FULL_FEE">FULL_FEE (100%)</option>
              <option value="HALF_FEE">HALF_FEE (50%)</option>
              <option value="NO_FEE">NO_FEE (Scholarship)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Student Data Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Code</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Guardian Mobile</TableHead>
                <TableHead>Fee Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                    Loading student roster...
                  </TableCell>
                </TableRow>
              ) : students.length > 0 ? (
                students.map((st) => (
                  <TableRow
                    key={st.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => navigate(`/students/${st.id}`)}
                  >
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {st.studentCode}
                    </TableCell>
                    <TableCell className="font-semibold text-xs">{st.fullName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {st.guardianMobile} ({st.guardianName})
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          st.feeCategory === 'FULL_FEE'
                            ? 'default'
                            : st.feeCategory === 'HALF_FEE'
                            ? 'warning'
                            : 'success'
                        }
                        className="text-[10px]"
                      >
                        {st.feeCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={st.status === 'ACTIVE' ? 'success' : 'destructive'}
                        className="text-[10px]"
                      >
                        {st.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(st.admissionDate).toLocaleDateString('en-LK')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/students/${st.id}`);
                          }}
                          title="View 360 Profile"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Deactivate student ${st.fullName} (${st.studentCode})?`)) {
                              deleteStudentMutation.mutate(st.id);
                            }
                          }}
                          title="Deactivate Student"
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
                    No student records found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
            <div>
              Showing {students.length} of {meta.totalItems} students
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span>
                Page {meta.page} of {meta.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Student Admission Processing Modal */}
      <StudentAdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
      />
    </div>
  );
};
