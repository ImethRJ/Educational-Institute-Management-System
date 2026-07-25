import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Download, CheckCircle2, AlertCircle } from 'lucide-react';

export const AttendanceSummaryPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(7);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const { data: attendanceResponse, isLoading } = useQuery({
    queryKey: ['attendance-records', selectedMonth, selectedYear],
    queryFn: () =>
      api.get(`/attendance?month=${selectedMonth}&year=${selectedYear}`),
  });

  const records = (attendanceResponse as any)?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Attendance Analytics</h1>
          <p className="text-xs text-muted-foreground">
            Monthly attendance summary reports & identification of 0% attendance students
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          <Download className="h-4 w-4 mr-1.5" /> Export Attendance Summary
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Select Month</label>
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
              <label className="text-xs font-semibold">Select Year</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Log Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student Code</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Batch Class</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                    Loading attendance summary...
                  </TableCell>
                </TableRow>
              ) : records.length > 0 ? (
                records.map((rec: any) => (
                  <TableRow key={rec.id}>
                    <TableCell className="text-xs">
                      {new Date(rec.attendanceDate).toLocaleDateString('en-LK')}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {rec.student?.studentCode}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">{rec.student?.fullName}</TableCell>
                    <TableCell className="text-xs">{rec.batchClass?.batchName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={rec.status === 'PRESENT' ? 'success' : 'destructive'}
                        className="text-[10px]"
                      >
                        {rec.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                    No attendance records logged for selected month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
