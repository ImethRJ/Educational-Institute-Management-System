import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Student, MonthlyInvoice } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, ShieldCheck, Printer, CreditCard } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'attendance'>('overview');

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

            <div className="flex flex-col items-end space-y-1">
              <div className="text-xs text-muted-foreground font-medium">Fee Concession Category:</div>
              <Badge
                variant={
                  student.feeCategory === 'FULL_FEE'
                    ? 'default'
                    : student.feeCategory === 'HALF_FEE'
                    ? 'warning'
                    : 'success'
                }
                className="text-xs font-semibold px-3 py-1"
              >
                {student.feeCategory}
              </Badge>
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
                <span className="text-muted-foreground">Date of Birth:</span>
                <span className="font-semibold">{new Date(student.dob).toLocaleDateString('en-LK')}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Mobile Number:</span>
                <span className="font-semibold">{student.mobileNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Email Address:</span>
                <span className="font-semibold">{student.email || 'N/A'}</span>
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
                          <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
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
    </div>
  );
};
