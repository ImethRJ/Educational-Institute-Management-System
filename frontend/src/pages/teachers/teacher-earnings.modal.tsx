import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Teacher } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { X, Banknote, Percent, Users, Receipt, Calendar } from 'lucide-react';

interface TeacherEarningsModalProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherEarningsModal: React.FC<TeacherEarningsModalProps> = ({
  teacher,
  isOpen,
  onClose,
}) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Fetch Teacher Earnings & Commission Breakdown from backend
  const { data: earningsResponse, isLoading } = useQuery({
    queryKey: ['teacher-earnings', teacher?.id, currentMonth, currentYear],
    queryFn: () => api.get(`/teachers/${teacher?.id}/earnings?month=${currentMonth}&year=${currentYear}`),
    enabled: !!teacher?.id && isOpen,
  });

  const earnings = (earningsResponse as any)?.data || {
    totalTuitionCollected: 0,
    teacherTuitionEarnings: 0,
    instituteTuitionRetained: 0,
    totalAdmissionCommissions: 0,
    netTeacherPayoutDue: 0,
    linkedPayments: [],
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl bg-card border-border shadow-2xl my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
              {teacher.fullName.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{teacher.fullName}</CardTitle>
              <div className="text-xs text-muted-foreground font-mono">
                Teacher Code: <strong className="text-primary">{teacher.teacherCode}</strong> | Default Share:{' '}
                <strong className="text-emerald-600">{Number(teacher.defaultTuitionCommissionPct).toFixed(1)}%</strong>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 max-h-[75vh] overflow-y-auto">
          {/* Summary Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-border bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardContent className="p-3">
                <div className="text-[11px] text-muted-foreground font-semibold">Total Tuition Collections</div>
                <div className="text-xl font-extrabold text-foreground mt-0.5">
                  LKR {isLoading ? '...' : Number(earnings.totalTuitionCollected || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800">
              <CardContent className="p-3">
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">Teacher Net Share ({teacher.defaultTuitionCommissionPct}%)</div>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  LKR {isLoading ? '...' : Number(earnings.teacherTuitionEarnings || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-3">
                <div className="text-[11px] text-muted-foreground font-semibold">Institute Retained Share ({(100 - Number(teacher.defaultTuitionCommissionPct)).toFixed(1)}%)</div>
                <div className="text-xl font-extrabold text-foreground mt-0.5">
                  LKR {isLoading ? '...' : Number(earnings.instituteTuitionRetained || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Linked Student Payments Log Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1">
              <Receipt className="h-4 w-4 text-primary" />
              <span>Linked Student Payments & Commission Split Log</span>
            </h3>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Teacher Share</TableHead>
                  <TableHead>Institute Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                      Loading payment breakdown...
                    </TableCell>
                  </TableRow>
                ) : earnings.linkedPayments && earnings.linkedPayments.length > 0 ? (
                  earnings.linkedPayments.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {p.receiptNumber}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{p.student?.fullName || 'Student'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {p.isAdmissionFee ? 'Admission Fee' : 'Tuition Fee'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-bold">
                        LKR {Number(p.amountPaid).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-emerald-600">
                        LKR {Number(p.teacherShareAmount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-muted-foreground">
                        LKR {Number(p.instituteShareAmount || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                      No student payments linked to this teacher for the current month yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
