import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PaymentMethod, Teacher } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { X, Receipt, Printer, CreditCard, Search, Loader2 } from 'lucide-react';

interface CashierCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStudentCode?: string;
  initialInvoiceId?: string;
  initialAmount?: number;
  initialTeacherId?: string;
  initialIsAdmissionFee?: boolean;
}

export const CashierCounterModal: React.FC<CashierCounterModalProps> = ({
  isOpen,
  onClose,
  initialStudentCode,
  initialInvoiceId,
  initialAmount,
  initialTeacherId,
  initialIsAdmissionFee,
}) => {
  const queryClient = useQueryClient();

  const [studentCodeInput, setStudentCodeInput] = useState(initialStudentCode || '');
  const [searchedStudent, setSearchedStudent] = useState<any>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | undefined>(initialInvoiceId);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(initialTeacherId || '');
  const [isAdmissionFee, setIsAdmissionFee] = useState(initialIsAdmissionFee || false);
  const [amountPaid, setAmountPaid] = useState<number>(initialAmount || 3500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountTendered, setAmountTendered] = useState<number>((initialAmount || 3500) + 1500);

  const searchMutation = useMutation({
    mutationFn: (code: string) => api.get(`/students/code/${code}`),
    onSuccess: (res: any) => {
      setSearchedStudent(res.data);
      toast.success(`Student loaded: ${res.data.fullName}`);
    },
    onError: () => {
      toast.error('Student code not found.');
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialStudentCode) {
        setStudentCodeInput(initialStudentCode);
        searchMutation.mutate(initialStudentCode.trim().toUpperCase());
      }
      if (initialInvoiceId) {
        setSelectedInvoiceId(initialInvoiceId);
      }
      if (initialAmount) {
        setAmountPaid(initialAmount);
        setAmountTendered(initialAmount);
      }
      if (initialTeacherId) {
        setSelectedTeacherId(initialTeacherId);
      }
      if (initialIsAdmissionFee !== undefined) {
        setIsAdmissionFee(initialIsAdmissionFee);
      }
    }
  }, [isOpen, initialStudentCode, initialInvoiceId, initialAmount, initialTeacherId, initialIsAdmissionFee]);

  const paymentMutation = useMutation({
    mutationFn: (payload: any) => api.post('/finance/payments', payload),
    onSuccess: (res: any) => {
      const receiptNo = res.data?.receiptNumber;
      toast.success(`Payment recorded successfully! Receipt: ${receiptNo}`);
      
      // Invalidate all related financial & dashboard query caches
      queryClient.invalidateQueries({ queryKey: ['invoices-list'] });
      queryClient.invalidateQueries({ queryKey: ['student-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['payments-list'] });
      queryClient.invalidateQueries({ queryKey: ['students-list'] });

      // Trigger PDF Receipt Download in new window
      if (receiptNo) {
        window.open(`/api/v1/pdf/receipt/${receiptNo}`, '_blank');
      }

      onClose();
    },
  });

  // Fetch Teacher List for Payment Linkage
  const { data: teachersResponse } = useQuery({
    queryKey: ['teachers-list'],
    queryFn: () => api.get('/teachers'),
    enabled: isOpen,
  });

  const rawTeachers = (teachersResponse as any)?.data;
  const teachers: Teacher[] = Array.isArray(rawTeachers) ? rawTeachers : rawTeachers?.items || [];

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCodeInput.trim()) return;
    searchMutation.mutate(studentCodeInput.trim().toUpperCase());
  };

  const handleRecordPayment = () => {
    if (!searchedStudent) {
      toast.error('Please search and select a student first.');
      return;
    }

    paymentMutation.mutate({
      studentId: searchedStudent.id,
      teacherId: selectedTeacherId || undefined,
      invoiceId: selectedInvoiceId || initialInvoiceId || undefined,
      isAdmissionFee,
      amountPaid: Number(amountPaid),
      paymentMethod,
    });
  };

  const balanceChange = amountTendered - amountPaid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-2xl bg-card border-border shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <Receipt className="h-5 w-5 text-emerald-600" />
            <div>
              <CardTitle className="text-lg font-bold">CASHIER BILLING COUNTER (F2)</CardTitle>
              <div className="text-xs text-muted-foreground font-semibold">
                Instant Student Fee Collection & PDF Receipt Printer
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 max-h-[75vh] overflow-y-auto">
          {/* Student Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <Input
              placeholder="Scan Student Barcode / Code (e.g. SEC-2026-COL-0001)..."
              value={studentCodeInput}
              onChange={(e) => setStudentCodeInput(e.target.value)}
              className="text-xs"
            />
            <Button type="submit" size="sm" disabled={searchMutation.isPending} className="text-xs font-semibold">
              {searchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
              Search Student
            </Button>
          </form>

          {/* Searched Student Card Summary */}
          {searchedStudent && (
            <div className="p-3 bg-muted/40 rounded-md border border-border space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">{searchedStudent.fullName}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="font-mono text-xs border-primary text-primary">
                    {searchedStudent.studentCode}
                  </Badge>
                  {searchedStudent.admissionFeePaid ? (
                    <Badge variant="success" className="text-[10px]">
                      Admission Fee: PAID
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">
                      Admission Fee: UNPAID (LKR {Number(searchedStudent.admissionFeeAmount || 2500).toLocaleString()})
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-muted-foreground items-center pt-1">
                <span>Fee Category: <strong className="text-foreground">{searchedStudent.feeCategory}</strong></span>
                <span>Guardian Mobile: <strong className="text-foreground">{searchedStudent.guardianMobile}</strong></span>
              </div>
              {!searchedStudent.admissionFeePaid && !isAdmissionFee && (
                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setIsAdmissionFee(true);
                      setAmountPaid(searchedStudent.admissionFeeAmount || 2500);
                      setAmountTendered((searchedStudent.admissionFeeAmount || 2500) + 500);
                    }}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-7 font-semibold"
                  >
                    <CreditCard className="h-3 w-3 mr-1" /> Switch to One-Time Admission Fee (LKR {searchedStudent.admissionFeeAmount || 2500})
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Payment Selection Details */}
          {searchedStudent && (
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Payment Type & Amount
              </h3>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant={!isAdmissionFee ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsAdmissionFee(false)}
                  className="text-xs flex-1"
                >
                  Monthly Tuition Fee
                </Button>
                <Button
                  type="button"
                  variant={isAdmissionFee ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setIsAdmissionFee(true);
                    setAmountPaid(searchedStudent.admissionFeeAmount || 2500);
                  }}
                  className="text-xs flex-1"
                >
                  One-Time Admission Fee (LKR {searchedStudent.admissionFeeAmount})
                </Button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Link Teacher for Revenue Split (Optional)</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                >
                  <option value="">-- Institute General Account --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.teacherCode} - {t.defaultTuitionCommissionPct}% Share)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Amount to Pay (LKR) *</label>
                  <Input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="font-bold text-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Payment Method *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Card / IPG</option>
                  </select>
                </div>
              </div>

              {/* Cash Balance Calculator */}
              {paymentMethod === 'CASH' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-md grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-emerald-900 dark:text-emerald-300">Amount Tendered (Cash):</label>
                    <Input
                      type="number"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(Number(e.target.value))}
                      className="mt-1 bg-background"
                    />
                  </div>
                  <div className="flex flex-col justify-center items-end">
                    <span className="text-muted-foreground font-semibold">Balance / Change to Return:</span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      LKR {balanceChange >= 0 ? balanceChange.toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleRecordPayment}
            disabled={paymentMutation.isPending || !searchedStudent}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {paymentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Recording Payment...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" /> Collect & Print PDF Receipt (Enter)
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
