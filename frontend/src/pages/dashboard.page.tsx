import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Users,
  UserCheck,
  Banknote,
  AlertCircle,
  TrendingUp,
  UserPlus,
  Receipt,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardProps {
  onQuickAdmission?: () => void;
  onQuickCashier?: () => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({
  onQuickAdmission,
  onQuickCashier,
}) => {
  // Fetch Real Live Dashboard Metrics from Database
  const { data: dashboardSummaryResponse, isLoading: loadingKPIs } = useQuery({
    queryKey: ['dashboard-kpi-summary'],
    queryFn: () => api.get('/finance/dashboard-summary'),
  });

  // Fetch Recent Student Registrations
  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['students-summary'],
    queryFn: () => api.get('/students?limit=5'),
  });

  const kpi = (dashboardSummaryResponse as any)?.data || {
    activeStudents: 0,
    activeTeachers: 0,
    monthlyIncome: 0,
    outstandingAmount: 0,
    unpaidInvoicesCount: 0,
    trendData: [],
  };

  const recentStudents = (studentsData as any)?.data || [];

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header Title & Quick Action Triggers Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executive Summary Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Live administrative stats and financial analytics for Sector Panadura Campus
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onQuickAdmission}
            className="text-xs font-semibold bg-primary hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            New Student Admission (F1)
          </Button>
          <Button
            onClick={onQuickCashier}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Receipt className="h-4 w-4 mr-1.5" />
            Cashier Counter (F2)
          </Button>
        </div>
      </div>

      {/* 4 Live KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Active Students */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              TOTAL ACTIVE STUDENTS
            </CardTitle>
            <Users className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingKPIs ? '...' : kpi.activeStudents.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center mt-1 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Live Database Count</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Active Teachers */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              ACTIVE TEACHERS
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingKPIs ? '...' : kpi.activeTeachers.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center mt-1">
              <span>Across Grades 1 to 13</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Real Monthly Income */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              MONTHLY INCOME ({currentMonthName})
            </CardTitle>
            <Banknote className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              LKR {loadingKPIs ? '...' : kpi.monthlyIncome.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              <span>Real Settled Collections</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Real Outstanding Payments */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              OUTSTANDING PAYMENTS
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              LKR {loadingKPIs ? '...' : kpi.outstandingAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
              {kpi.unpaidInvoicesCount} unpaid student invoices
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Collection Trend Chart (2 columns) */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Fee Collection & Revenue Analytics (LKR)</span>
              <Badge variant="outline" className="text-[10px]">
                Real Collections
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.trendData.length > 0 ? kpi.trendData : [{ month: 'Current', revenue: 0 }]}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis
                    fontSize={11}
                    tickFormatter={(v) => `LKR ${v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`LKR ${Number(value).toLocaleString()}`, 'Amount']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Student Admissions Card (1 column) */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Recent Student Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.length > 0 ? (
                recentStudents.map((st: any) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="text-xs font-semibold">{st.fullName}</div>
                      <div className="text-[10px] text-muted-foreground">
                        Code: <span className="font-mono text-primary">{st.studentCode}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        st.feeCategory === 'FULL_FEE'
                          ? 'default'
                          : st.feeCategory === 'HALF_FEE'
                          ? 'warning'
                          : 'success'
                      }
                      className="text-[10px]"
                    >
                      {st.feeCategory}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No student admissions recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
