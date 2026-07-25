import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { FileSpreadsheet, Download, BarChart3, Users, Receipt, Percent, FileText, Loader2 } from 'lucide-react';

export const ReportsCenterPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(7);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Fetch Teacher Payout Summary JSON Data for Live UI Preview
  const { data: teacherPayoutResponse, isLoading: loadingPayouts } = useQuery({
    queryKey: ['teacher-payout-summary', selectedMonth, selectedYear],
    queryFn: () => api.get(`/reports/teacher-payout/summary?month=${selectedMonth}&year=${selectedYear}`),
  });

  const teacherPayouts: any[] = (teacherPayoutResponse as any)?.data || [];

  const handleDownloadFeeCollectionExcel = () => {
    window.open(`/api/v1/reports/fee-collection/excel?month=${selectedMonth}&year=${selectedYear}`, '_blank');
  };

  const handleDownloadTeacherPayoutExcel = () => {
    window.open(`/api/v1/reports/teacher-payout/excel?month=${selectedMonth}&year=${selectedYear}`, '_blank');
  };

  const handleDownloadTeacherPayoutPdf = () => {
    window.open(`/api/v1/pdf/teacher-payout-summary?month=${selectedMonth}&year=${selectedYear}`, '_blank');
  };

  const totalGrossCollections = teacherPayouts.reduce((acc, curr) => acc + (curr.totalGross || 0), 0);
  const totalTeacherPayouts = teacherPayouts.reduce((acc, curr) => acc + (curr.teacherPayout || 0), 0);
  const totalInstituteShare = teacherPayouts.reduce((acc, curr) => acc + (curr.instituteShare || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics Center</h1>
        <p className="text-xs text-muted-foreground">
          Export administrative spreadsheets, financial collection reports, and teacher payout reconciliations
        </p>
      </div>

      {/* Month & Year Filter Bar */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Report Period Month</label>
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
              <label className="text-xs font-semibold">Report Period Year</label>
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

      {/* Report Types Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report 1: Monthly Fee Collection Report */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center space-x-3 pb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-lg text-emerald-600">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Monthly Fee Collection Report</CardTitle>
              <p className="text-xs text-muted-foreground">
                Detailed transaction log with student codes, payment methods, and revenue split breakdown.
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex justify-end">
            <Button size="sm" onClick={handleDownloadFeeCollectionExcel} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <Download className="h-4 w-4 mr-1.5" /> Download Excel (.xlsx)
            </Button>
          </CardContent>
        </Card>

        {/* Report 2: Teacher Earnings & Payout Reconciliation */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center space-x-3 pb-2">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/60 rounded-lg text-sky-600">
              <Percent className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Teacher Earnings & Payout Summary</CardTitle>
              <p className="text-xs text-muted-foreground">
                Teacher tuition commission shares, admission fee commissions, and net payout statements.
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex justify-end space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadTeacherPayoutExcel}
              className="text-xs border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950"
            >
              <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Export Excel (.xlsx)
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadTeacherPayoutPdf}
              className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold"
            >
              <FileText className="h-4 w-4 mr-1.5" /> Export Payout PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Teacher Payout Summary Table Preview */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold">Teacher Payout Reconciliation Summary</CardTitle>
            <p className="text-xs text-muted-foreground">
              Live breakdown of gross collections, teacher payout shares, and institute net share for {selectedMonth}/{selectedYear}
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {teacherPayouts.length} Teachers Recorded
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher Code</TableHead>
                <TableHead>Teacher Name</TableHead>
                <TableHead className="text-center">Commission Split %</TableHead>
                <TableHead className="text-right">Gross Collections (LKR)</TableHead>
                <TableHead className="text-right">Teacher Payout Share (LKR)</TableHead>
                <TableHead className="text-right">Institute Net Share (LKR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingPayouts ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Loading payout data...
                  </TableCell>
                </TableRow>
              ) : teacherPayouts.length > 0 ? (
                teacherPayouts.map((t) => (
                  <TableRow key={t.teacherId}>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {t.teacherCode}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">{t.fullName}</TableCell>
                    <TableCell className="text-center text-xs font-medium">
                      {t.commissionPct}%
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">
                      LKR {t.totalGross.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono font-bold text-sky-600">
                      LKR {t.teacherPayout.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono font-bold text-emerald-600">
                      LKR {t.instituteShare.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                    No teacher payout records found for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {teacherPayouts.length > 0 && (
            <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center text-xs font-bold">
              <span>TOTAL PERIOD PAYOUT RECONCILIATION:</span>
              <div className="space-x-4 font-mono">
                <span className="text-sky-600">Teacher Payouts: LKR {totalTeacherPayouts.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                <span>|</span>
                <span className="text-emerald-600">Institute Net Retained: LKR {totalInstituteShare.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

