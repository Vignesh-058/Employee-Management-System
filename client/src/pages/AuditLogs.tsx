import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Shield, Search, Download, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-100 text-blue-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  PASSWORD_RESET: 'bg-orange-100 text-orange-800',
  PASSWORD_CHANGE: 'bg-orange-100 text-orange-800',
  EMAIL_VERIFICATION: 'bg-green-100 text-green-800',
  TOKEN_REFRESH: 'bg-purple-100 text-purple-800',
  DEVICE_REMOVED: 'bg-red-100 text-red-800',
  EMPLOYEE_CREATE: 'bg-emerald-100 text-emerald-800',
  EMPLOYEE_UPDATE: 'bg-yellow-100 text-yellow-800',
  EMPLOYEE_DELETE: 'bg-red-100 text-red-800',
  PAYROLL_GENERATED: 'bg-indigo-100 text-indigo-800',
  LEAVE_APPROVED: 'bg-teal-100 text-teal-800',
  LEAVE_REJECTED: 'bg-pink-100 text-pink-800',
};

const ACTION_OPTIONS = [
  'All Actions', 'LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'PASSWORD_CHANGE',
  'EMAIL_VERIFICATION', 'TOKEN_REFRESH', 'DEVICE_REMOVED', 'EMPLOYEE_CREATE',
  'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE', 'PAYROLL_GENERATED', 'LEAVE_APPROVED', 'LEAVE_REJECTED',
];

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-logs', page, actionFilter],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 30 };
      if (actionFilter !== 'All Actions') params.action = actionFilter;
      const res = await api.get('/audit-logs', { params });
      return res.data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['audit-log-stats'],
    queryFn: async () => {
      const res = await api.get('/audit-logs/stats');
      return res.data.data;
    },
  });

  const logs = data?.data || [];
  const pagination = data?.pagination;

  const filteredLogs = search
    ? logs.filter((l: any) =>
        l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.details?.toLowerCase().includes(search.toLowerCase()) ||
        l.userId?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const exportCSV = () => {
    const header = 'Timestamp,User,Action,Details,IP\n';
    const rows = logs.map((l: any) =>
      `"${format(new Date(l.createdAt), 'yyyy-MM-dd HH:mm:ss')}","${l.userId?.name || 'System'}","${l.action}","${l.details || ''}","${l.ipAddress || ''}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" /> Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">Complete security event log for your enterprise.</p>
        </div>
        <Button variant="outline" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      {statsData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {statsData.slice(0, 5).map((s: any, i: number) => (
            <motion.div key={s._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="text-center py-2">
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground truncate">{s._id}</p>
                  <p className="text-2xl font-bold text-primary">{s.count}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={v => { setActionFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Logs Timeline */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading audit logs...</div>
      ) : isError ? (
        <div className="text-center text-red-500 py-8">Failed to load audit logs.</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Timeline
              <Badge variant="secondary">{pagination?.total || 0} total events</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4 pl-10">
                {filteredLogs.length === 0 ? (
                  <div className="text-muted-foreground text-sm py-4">No audit events found.</div>
                ) : (
                  filteredLogs.map((log: any, i: number) => (
                    <motion.div
                      key={log._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="relative flex items-start gap-4 pb-4 border-b border-border last:border-0"
                    >
                      {/* Dot on timeline */}
                      <div className="absolute -left-6 w-3 h-3 rounded-full bg-primary border-2 border-background mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'} variant="outline">
                            {log.action}
                          </Badge>
                          {log.userId && (
                            <span className="text-sm font-medium">{log.userId.name || log.userId.email}</span>
                          )}
                          {log.ipAddress && (
                            <span className="text-xs text-muted-foreground font-mono">{log.ipAddress}</span>
                          )}
                        </div>
                        {log.details && (
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(log.createdAt), 'MMM dd, yyyy · HH:mm:ss')}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 mt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
