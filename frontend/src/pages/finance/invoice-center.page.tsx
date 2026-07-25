import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { MonthlyInvoice, InvoiceStatus } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { CashierCounterModal } from './cashier-counter.modal';
import { toast } from 'sonner';
import { Receipt, AlertCircle, CheckCircle2, ShieldAlert, CreditCard, RefreshCw, Loader2, X } from 'lucide-react';

export const InvoiceCenterPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedMonth, setSelectedMonth] = useState<number>(7);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCashierOpen, setIsCashierOpen] = useState(false);

  // Override Modal state
  const [overrideInvoiceId, setOverrideInvoiceId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>('');

  const { data: invoicesResponse, isLoading } = useQuery({
    queryKey: ['invoices-list', selectedMonth, selectedYear, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('month', selectedMonth.toString());
      params.append('year', selectedYear.toString());
      if (statusFilter) params.append('status', statusFilter);
      return api.get(`/finance/invoices?${params.toString()}`);
    },
  });

  // Run Monthly Invoice Generator
  const generateMutation = useMutation({
    mutationFn: () =>
      api.post('/finance/invoices/generate-monthly', {
        billingMonth: selectedMonth,
        billingYear: selectedYear,
      }),
    onSuccess: (res: any) => {
      toast.success(
        `Invoice Engine Run Complete: Generated ${res.data.generatedCount} invoices. (${res.data.suppressedCount} suppressed due to 0% attendance)`,
      );
      queryClient.invalidateQueries({ queryKey: ['invoices-list'] });
    },
  });

  // Override Zero Attendance Mutation
  const overrideMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      api.put(`/finance/invoices/${invoiceId}/override-zero-attendance`, {
        overrideReason,
      }),
    onSuccess: () => {
      toast.success('Zero attendance override approved and logged in audit trail!');
      queryClient.invalidateQueries({ queryKey: ['invoices-list'] });
      setOverrideInvoiceId(null);
      setOverrideReason('');
    },
  });

  const invoices: MonthlyInvoice[] = (invoicesResponse as any)?.data || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Invoice Center</h1>
          <p className="text-xs text-muted-foreground">
            Manage billing, zero-attendance fee suppression rules, and cashier payment processing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="text-xs font-semibold bg-primary hover:bg-primary/90"
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
            Run Invoice Generator Engine
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCashierOpen(true)}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CreditCard className="h-4 w-4 mr-1.5" /> Open Cashier Counter (F2)
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Billing Month</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Billing Year</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Payment Status</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="UNPAID">UNPAID</option>
                <option value="PAID">PAID</option>
                <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Data Grid Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Student Code</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Fee Cat.</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Att. %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action / Audit Override</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : invoices.length > 0 ? (
                invoices.map((inv) => {
                  const isZeroAtt = Number(inv.attendancePercentage) === 0 && !inv.isZeroAttendanceOverride;

                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {inv.student?.studentCode}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{inv.student?.fullName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {inv.feeCategoryApplied}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-bold">
                        LKR {Number(inv.finalAmountDue).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {Number(inv.attendancePercentage).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            inv.status === 'PAID'
                              ? 'success'
                              : isZeroAtt
                              ? 'destructive'
                              : 'warning'
                          }
                          className="text-[10px]"
                        >
                          {isZeroAtt ? '🔴 SUPPRESSED (0% Att)' : inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isZeroAtt ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setOverrideInvoiceId(inv.id)}
                            className="text-[11px] h-7"
                          >
                            <ShieldAlert className="h-3 w-3 mr-1" /> Approve Override
                          </Button>
                        ) : inv.status === 'UNPAID' ? (
                          <Button
                            size="sm"
                            onClick={() => setIsCashierOpen(true)}
                            className="text-[11px] h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Pay Fee
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Settled</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                    No monthly invoices found. Click "Run Invoice Generator Engine" to generate.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Zero Attendance Admin Override Modal */}
      {overrideInvoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md bg-card border-border shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-bold flex items-center space-x-2 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
                <span>0% Attendance Fee Override Justification</span>
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setOverrideInvoiceId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                This student has recorded 0% attendance for the billing month. System audit policy requires a mandatory administrative reason to issue this invoice.
              </p>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Override Reason (Mandatory Audit Log) *</label>
                <Input
                  placeholder="e.g. Admin approved medical exemption billing continuation..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>
            <div className="p-4 border-t border-border flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setOverrideInvoiceId(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={overrideMutation.isPending || overrideReason.length < 10}
                onClick={() => overrideMutation.mutate(overrideInvoiceId)}
              >
                Confirm Override & Issue Invoice
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Cashier Billing Counter Modal */}
      <CashierCounterModal
        isOpen={isCashierOpen}
        onClose={() => setIsCashierOpen(false)}
      />
    </div>
  );
};
