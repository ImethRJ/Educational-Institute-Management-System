import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { BatchClass, AttendanceStatus } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Search, Save, Loader2, Barcode } from 'lucide-react';

export const RapidAttendancePage: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});

  // Fetch Available Batches
  const { data: batchesResponse } = useQuery({
    queryKey: ['batches-list'],
    queryFn: () => api.get('/academic/batches'),
  });

  // Fetch Batch Details (Enrolled Students)
  const { data: batchDetailsResponse, isLoading: loadingBatch } = useQuery({
    queryKey: ['batch-details', selectedBatchId],
    queryFn: () => api.get(`/academic/batches/${selectedBatchId}`),
    enabled: !!selectedBatchId,
  });

  const batches: BatchClass[] = (batchesResponse as any)?.data || [];
  const enrolledStudents = (batchDetailsResponse as any)?.data?.enrollments || [];

  // Submit Bulk Attendance Mutation
  const mutation = useMutation({
    mutationFn: (payload: any) => api.post('/attendance/mark-bulk', payload),
    onSuccess: () => {
      toast.success('Daily attendance saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
    },
  });

  const handleStatusToggle = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    // Search student by code among enrolled students
    const matched = enrolledStudents.find(
      (en: any) => en.student?.studentCode?.toUpperCase() === barcodeInput.trim().toUpperCase(),
    );

    if (matched) {
      handleStatusToggle(matched.student.id, 'PRESENT');
      toast.success(`Marked PRESENT: ${matched.student.fullName}`);
      setBarcodeInput('');
    } else {
      toast.error(`Student code ${barcodeInput} not found in this batch class.`);
    }
  };

  const handleSaveAttendance = () => {
    if (!selectedBatchId) {
      toast.error('Please select a batch class first.');
      return;
    }

    const records = enrolledStudents.map((en: any) => ({
      studentId: en.student.id,
      status: attendanceMap[en.student.id] || 'ABSENT',
    }));

    mutation.mutate({
      batchClassId: selectedBatchId,
      attendanceDate,
      records,
    });
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'PRESENT').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rapid Class Attendance Marking</h1>
          <p className="text-xs text-muted-foreground">
            Daily student entry via Barcode Scanner or rapid status toggles
          </p>
        </div>
        <Button
          onClick={handleSaveAttendance}
          disabled={mutation.isPending || !selectedBatchId}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1.5" /> Save Attendance (Ctrl+S)
            </>
          )}
        </Button>
      </div>

      {/* Batch & Date Selector Card */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold">Select Batch Class *</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  setAttendanceMap({});
                }}
              >
                <option value="">-- Choose Active Batch Class --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchName} ({b.teacher?.fullName})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Attendance Date *</label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barcode Scanner Input */}
      {selectedBatchId && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <form onSubmit={handleBarcodeScan} className="flex items-center space-x-3">
              <Barcode className="h-5 w-5 text-primary" />
              <Input
                placeholder="Scan Student Barcode / Enter Student Code (e.g. SEC-2026-COL-0001)..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="text-xs bg-background"
              />
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Mark Present
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Student Attendance Grid */}
      {selectedBatchId && (
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Class Student Roster</CardTitle>
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-emerald-600 font-bold">Present: {presentCount}</span>
              <span>•</span>
              <span className="text-rose-600 font-bold">
                Absent: {enrolledStudents.length - presentCount}
              </span>
              <span>•</span>
              <span>Total: {enrolledStudents.length}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Code</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">Status Toggle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingBatch ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-xs text-muted-foreground">
                      Loading batch roster...
                    </TableCell>
                  </TableRow>
                ) : enrolledStudents.length > 0 ? (
                  enrolledStudents.map((en: any) => {
                    const st = en.student;
                    const status = attendanceMap[st.id] || 'ABSENT';
                    const isPresent = status === 'PRESENT';

                    return (
                      <TableRow key={st.id}>
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          {st.studentCode}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{st.fullName}</TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex rounded-md shadow-sm" role="group">
                            <Button
                              type="button"
                              size="sm"
                              variant={isPresent ? 'default' : 'outline'}
                              onClick={() => handleStatusToggle(st.id, 'PRESENT')}
                              className={`text-xs ${
                                isPresent ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> (P) PRESENT
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={!isPresent ? 'destructive' : 'outline'}
                              onClick={() => handleStatusToggle(st.id, 'ABSENT')}
                              className="text-xs"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> (A) ABSENT
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-xs text-muted-foreground">
                      No enrolled students found in this batch.
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
