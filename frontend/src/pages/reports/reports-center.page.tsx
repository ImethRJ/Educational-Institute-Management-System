import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileSpreadsheet, Download, BarChart3, Users, Receipt, Percent } from 'lucide-react';

export const ReportsCenterPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(7);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const handleDownloadExcel = () => {
    window.open(`/api/v1/reports/fee-collection/excel?month=${selectedMonth}&year=${selectedYear}`, '_blank');
  };

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
            <Button size="sm" onClick={handleDownloadExcel} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
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
          <CardContent className="pt-4 flex justify-end">
            <Button size="sm" variant="outline" className="text-xs">
              <Download className="h-4 w-4 mr-1.5" /> Export Payout PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
