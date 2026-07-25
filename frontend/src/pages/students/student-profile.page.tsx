import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Student, MonthlyInvoice } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { StudentEnrollModal } from './student-enroll-modal';
import { CashierCounterModal } from '../finance/cashier-counter.modal';
import { toast } from 'sonner';
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, ShieldCheck, Printer, CreditCard, BookOpen, Plus, Trash2 } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'attendance'>('overview');
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isCashierOpen, setIsCashierOpen] = useState(false);
  const [isCashierAdmissionFee, setIsCashierAdmissionFee] = useState(false);
  const [payFeeInvoiceId, setPayFeeInvoiceId] = useState<string | undefined>(undefined);
  const [payFeeAmount, setPayFeeAmount] = useState<number | undefined>(undefined);
  const [payFeeTeacherId, setPayFeeTeacherId] = useState<string | undefined>(undefined);

  // Fetch Student 360 Details
  const { data: studentResponse, isLoading } = useQuery({
    queryKey: ['student-profile', id],
    queryFn: () => api.get(`/students/${id}`),
    enabled: !!id,
  });

  // Fetch Student Invoices
  const { data: invoicesResponse } = useQuery({
    queryKey: ['student-invoices', id],
    queryFn: () => api.get(`/finance/invoices`),
    enabled: !!id,
  });

  const unenrollMutation = useMutation({
    mutationFn: (batchClassId: string) => api.delete(`/students/${id}/enroll/${batchClassId}`),
    onSuccess: () => {
      toast.success('Student unenrolled from class successfully.');
      queryClient.invalidateQueries({ queryKey: ['student-profile', id] });
    },
  });

  const student: Student = (studentResponse as any)?.data;
  const invoices: MonthlyInvoice[] = ((invoicesResponse as any)?.data || []).filter(
    (inv: any) => inv.studentId === id,
  );

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-muted-foreground">Loading student 360 profile...</div>;
  }

  if (!student) {
    return <div className="p-8 text-center text-xs text-rose-500">Student record not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/students')} className="text-xs">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Student Roster
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Printer className="h-4 w-4 mr-1.5" /> Print Profile PDF
          </Button>
        </div>
      </div>

      {/* Hero Profile Summary Header Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-2xl border border-primary/20">
                {student.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold">{student.fullName}</h1>
                  <Badge variant={student.status === 'ACTIVE' ? 'success' : 'destructive'} className="text-[10px]">
                    {student.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  Student ID: <span className="font-bold text-primary">{student.studentCode}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-3">
                  <span>Enrolled: {new Date(student.admissionDate).toLocaleDateString('en-LK')}</span>
                  <span>•</span>
                  <span>Gender: {student.gender}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2">
                <div className="text-xs text-muted-foreground font-medium">Fee Category:</div>
                <Badge
                  variant={
                    student.feeCategory === 'FULL_FEE'
                      ? 'default'
                      : student.feeCategory === 'HALF_FEE'
                      ? 'warning'
                      : 'success'
                  }
                  className="text-xs font-semibold px-2.5 py-0.5"
                >
                  {student.feeCategory}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                {student.admissionFeePaid ? (
                  <Badge variant="success" className="text-xs font-semibold px-2.5 py-0.5">
                    Admission Fee: PAID
                  </Badge>
                ) : (
                  <>
                    <Badge variant="destructive" className="text-xs font-semibold px-2.5 py-0.5">
                      Admission Fee: UNPAID (LKR {Number(student.admissionFeeAmount || 2500).toLocaleString()})
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsCashierAdmissionFee(true);
                        setPayFeeAmount(Number(student.admissionFeeAmount || 2500));
                        setIsCashierOpen(true);
                      }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-7"
                    >
                      <CreditCard className="h-3.5 w-3.5 mr-1" /> Pay Admission Fee
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation Buttons */}
      <div className="flex space-x-2 border-b border-border pb-2">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
          className="text-xs font-semibold"
        >
          Profile Overview
        </Button>
        <Button
          variant={activeTab === 'invoices' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('invoices')}
          className="text-xs font-semibold"
        >
          Invoices & Fee History ({invoices.length})
        </Button>
      </div>

      {/* Tab 1: Profile Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal & Contact Details */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center space-x-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>Personal & Contact Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Branch:</span>
                  <span className="font-semibold text-primary">{student.branch?.name || 'Main Branch'}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-semibold">{new Date(student.dob).toLocaleDateString('en-LK')}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Mobile Number:</span>
                  <span className="font-semibold">{student.mobileNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Home Address:</span>
                  <span className="font-semibold text-right max-w-xs">{student.address}</span>
                </div>
              </CardContent>
            </Card>

            {/* Guardian Info */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Guardian Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Guardian Name:</span>
                  <span className="font-semibold">{student.guardianName}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Relationship:</span>
                  <span className="font-semibold">{student.guardianRelationship}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Guardian Mobile:</span>
                  <span className="font-semibold text-primary">{student.guardianMobile}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Guardian Email:</span>
                  <span className="font-semibold">{student.guardianEmail || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrolled Batch Classes & Subjects Section */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Enrolled Batch Classes & Subjects</CardTitle>
                <Badge variant="outline" className="text-xs font-normal">
                  {student.enrollments?.length || 0} Classes
                </Badge>
              </div>
              <Button
                size="sm"
                onClick={() => setIsEnrollOpen(true)}
                className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Enroll in Additional Class / Subject
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Class Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Assigned Teacher</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Enrollment Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.enrollments && student.enrollments.length > 0 ? (
                    student.enrollments.map((enr: any) => (
                      <TableRow key={enr.id}>
                        <TableCell className="font-semibold text-xs text-foreground">
                          {enr.batchClass?.batchName}
                        </TableCell>
                        <TableCell className="text-xs">{enr.batchClass?.subject?.name}</TableCell>
                        <TableCell className="text-xs font-semibold text-emerald-600">
                          {enr.batchClass?.teacher?.fullName || 'Assigned Instructor'}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold">
                          LKR {Number(enr.batchClass?.monthlyFee || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success" className="text-[10px]">
                            ACTIVE
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Unenroll ${student.fullName} from batch '${enr.batchClass?.batchName}'?`)) {
                                unenrollMutation.mutate(enr.batchClass?.id);
                              }
                            }}
                            className="text-xs text-rose-500 hover:text-rose-700"
                            title="Unenroll from this batch class"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Unenroll
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                        Student is not currently enrolled in any active batch classes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Invoices & Payments */}
      {activeTab === 'invoices' && (
        <Card className="border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Billing Period</TableHead>
                  <TableHead>Class/Subject</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}</TableCell>
                      <TableCell className="text-xs">
                        {inv.billingYear}/{String(inv.billingMonth).padStart(2, '0')}
                      </TableCell>
                      <TableCell className="text-xs">{inv.batchClass?.batchName || 'Tuition Fee'}</TableCell>
                      <TableCell className="text-xs font-semibold">
                        LKR {Number(inv.finalAmountDue).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={inv.status === 'PAID' ? 'success' : 'destructive'}
                          className="text-[10px]"
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {inv.status === 'UNPAID' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setPayFeeInvoiceId(inv.id);
                              setPayFeeAmount(Number(inv.finalAmountDue));
                              setPayFeeTeacherId(inv.batchClass?.teacherId || inv.batchClass?.teacher?.id);
                              setIsCashierOpen(true);
                            }}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            <CreditCard className="h-3.5 w-3.5 mr-1" /> Pay Now
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                      No monthly invoices generated for this student yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Student Additional Class Enrollment Modal */}
      <StudentEnrollModal
        studentId={student.id}
        studentName={student.fullName}
        enrolledBatchIds={(student.enrollments || []).map((e: any) => e.batchClassId || e.batchClass?.id).filter(Boolean)}
        isOpen={isEnrollOpen}
        onClose={() => setIsEnrollOpen(false)}
      />

      {/* Cashier Billing Counter Modal */}
      <CashierCounterModal
        isOpen={isCashierOpen}
        onClose={() => {
          setIsCashierOpen(false);
          setIsCashierAdmissionFee(false);
          setPayFeeInvoiceId(undefined);
          setPayFeeAmount(undefined);
          setPayFeeTeacherId(undefined);
        }}
        initialStudentCode={student.studentCode}
        initialInvoiceId={payFeeInvoiceId}
        initialAmount={payFeeAmount}
        initialTeacherId={payFeeTeacherId}
        initialIsAdmissionFee={isCashierAdmissionFee}
      />
    </div>
  );
};
