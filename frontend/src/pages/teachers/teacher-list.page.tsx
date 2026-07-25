import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Teacher } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { TeacherCommissionModal } from './teacher-commission.modal';
import { Search, UserCheck, Percent, Settings, Phone, Calendar } from 'lucide-react';

export const TeacherListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

  const { data: teachersResponse, isLoading } = useQuery({
    queryKey: ['teachers-list', search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      return api.get(`/teachers?${params.toString()}`);
    },
  });

  const teachers: Teacher[] = (teachersResponse as any)?.data || [];

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teacher Directory & Earnings</h1>
          <p className="text-xs text-muted-foreground">
            Manage teacher profiles, subject allocations, and tuition & admission commission rules
          </p>
        </div>
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
                <TableHead>Tuition Comm. %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTeacher(tch);
                          setIsCommissionModalOpen(true);
                        }}
                        className="text-xs"
                      >
                        <Percent className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Commission Rules
                      </Button>
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

      {/* Commission Configuration Modal */}
      {selectedTeacher && (
        <TeacherCommissionModal
          teacher={selectedTeacher}
          isOpen={isCommissionModalOpen}
          onClose={() => setIsCommissionModalOpen(false)}
        />
      )}
    </div>
  );
};
