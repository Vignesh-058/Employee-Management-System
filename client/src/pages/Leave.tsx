import { useState } from 'react';
import { useLeaves, useApplyLeave, useUpdateLeaveStatus } from '../hooks/useLeave';
import { LeaveRequest } from '../types/leave.types';
import { DataTable } from '../components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, Clock, CheckCircle, XCircle, PlusCircle, CalendarX2 } from 'lucide-react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';

const leaveSchema = z.object({
  leaveType: z.enum(['Casual Leave', 'Sick Leave', 'Annual Leave']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Please provide a reason (min 10 characters)'),
  employeeId: z.string().optional(),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Annual Leave'];
const ANNUAL_QUOTAS = { 'Casual Leave': 10, 'Sick Leave': 12, 'Annual Leave': 21 };

const StatusBadge = ({ status }: { status: string }) => {
  const colorMap: Record<string, string> = {
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  return <Badge variant="outline" className={colorMap[status] || ''}>{status}</Badge>;
};

export default function Leave() {
  const { data, isLoading, isError } = useLeaves();
  const applyMutation = useApplyLeave();
  const updateStatusMutation = useUpdateLeaveStatus();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const isManager = ['Super Admin', 'HR Manager', 'Department Manager'].includes(user?.role || '');

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: { leaveType: 'Casual Leave' },
  });

  const leaves: LeaveRequest[] = data?.data || [];

  const personalLeaves = leaves.filter((l: LeaveRequest) => {
    const emp = l.employeeId;
    return typeof emp === 'object' && emp?.email === user?.email;
  });

  const myLeaves = isManager ? leaves : personalLeaves;

  const pendingLeaves = leaves.filter(l => l.status === 'Pending');
  const approvedLeaves = leaves.filter(l => l.status === 'Approved');
  const rejectedLeaves = leaves.filter(l => l.status === 'Rejected');

  // Calculate leave balance for current user (only their own leaves)
  const usedLeaves: Record<string, number> = {};
  personalLeaves.filter(l => l.status === 'Approved' || l.status === 'Pending').forEach(l => {
    const days = differenceInDays(new Date(l.endDate), new Date(l.startDate)) + 1;
    usedLeaves[l.leaveType] = (usedLeaves[l.leaveType] || 0) + days;
  });

  const onSubmit = async (formData: LeaveFormData) => {
    try {
      await applyMutation.mutateAsync(formData as any);
      reset();
      setIsFormOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (id: string) => {
    await updateStatusMutation.mutateAsync({ id, status: 'Approved' });
  };

  const handleReject = async (id: string) => {
    await updateStatusMutation.mutateAsync({ id, status: 'Rejected' });
  };

  const columns: ColumnDef<LeaveRequest>[] = [
    {
      accessorKey: 'employeeId',
      header: 'Employee',
      cell: ({ row }) => {
        const emp = row.original.employeeId;
        return <div className="font-medium">{typeof emp === 'object' && emp ? emp.name : 'N/A'}</div>;
      },
    },
    {
      accessorKey: 'leaveType',
      header: 'Leave Type',
      cell: ({ row }) => <Badge variant="secondary">{row.getValue('leaveType')}</Badge>,
    },
    {
      accessorKey: 'startDate',
      header: 'Duration',
      cell: ({ row }) => {
        const start = new Date(row.original.startDate);
        const end = new Date(row.original.endDate);
        const days = differenceInDays(end, start) + 1;
        return (
          <div>
            <div className="font-medium">{format(start, 'MMM dd')} – {format(end, 'MMM dd, yyyy')}</div>
            <div className="text-xs text-muted-foreground">{days} day{days !== 1 ? 's' : ''}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {row.getValue('reason')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Applied',
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(row.getValue('createdAt')), { addSuffix: true })}
        </div>
      ),
    },
    ...(isManager ? [{
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        if (row.original.status !== 'Pending') return null;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-300 hover:bg-green-50"
              onClick={() => handleApprove(row.original._id)}
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle className="w-3 h-3 mr-1" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => handleReject(row.original._id)}
              disabled={updateStatusMutation.isPending}
            >
              <XCircle className="w-3 h-3 mr-1" /> Reject
            </Button>
          </div>
        );
      },
    }] : []),
  ];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading leave requests...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load leave requests.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground mt-1">
            {isManager ? 'Manage and approve leave requests.' : 'Apply for leave and track your requests.'}
          </p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" /> Apply Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Controller
                  name="leaveType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAVE_TYPES.map(lt => <SelectItem key={lt} value={lt}>{lt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.leaveType && <p className="text-xs text-destructive">{errors.leaveType.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" {...register('startDate')} min={new Date().toISOString().split('T')[0]} />
                  {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" {...register('endDate')} min={new Date().toISOString().split('T')[0]} />
                  {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <textarea
                  {...register('reason')}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Describe the reason for leave..."
                />
                {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" disabled={applyMutation.isPending}>
                  {applyMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { reset(); setIsFormOpen(false); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Requests', value: leaves.length, icon: CalendarDays, color: 'text-blue-600' },
          { label: 'Pending', value: pendingLeaves.length, icon: Clock, color: 'text-yellow-600' },
          { label: 'Approved', value: approvedLeaves.length, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Rejected', value: rejectedLeaves.length, icon: CalendarX2, color: 'text-red-600' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Leave Balance */}
      <div className="w-full">
        {/* Leave Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leave Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {LEAVE_TYPES.map(lt => {
              const quota = ANNUAL_QUOTAS[lt as keyof typeof ANNUAL_QUOTAS];
              const used = usedLeaves[lt] || 0;
              const remaining = Math.max(0, quota - used);
              const pct = Math.min(100, (remaining / quota) * 100);
              return (
                <div key={lt}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{lt}</span>
                    <span className="text-muted-foreground">{remaining} / {quota} days left</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct < 20 ? 'bg-red-500' : pct < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isManager ? 'All Leave Requests' : 'My Leave Requests'}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={isManager ? leaves : myLeaves}
            searchKey="leaveType"
            searchPlaceholder="Filter by leave type..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
