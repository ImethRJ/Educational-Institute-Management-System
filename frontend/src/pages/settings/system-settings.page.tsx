import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { ShieldCheck, History, Building2 } from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const { data: auditResponse, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/audit/logs?limit=30'),
  });

  const auditLogs = (auditResponse as any)?.data?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Settings & Audit Logs</h1>
        <p className="text-xs text-muted-foreground">
          Institute profile configuration and administrative security audit trail
        </p>
      </div>

      {/* Audit Log Table Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center space-x-2">
            <History className="h-4 w-4 text-primary" />
            <span>Administrative Audit Log Trail</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin User</TableHead>
                <TableHead>Action Code</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                    Loading audit trail...
                  </TableCell>
                </TableRow>
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      {log.admin?.fullName || 'system_admin'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] border-primary text-primary">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{log.entityName}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {log.ipAddress || '127.0.0.1'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                    No audit log entries recorded yet.
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
