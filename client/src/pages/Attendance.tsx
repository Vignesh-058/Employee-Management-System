import { useState } from 'react';
import { useAttendance, useAttendanceStats } from '../hooks/useAttendance';
import { AttendanceRecord } from '../types/attendance.types';
import { DataTable } from '../components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../components/ui/button';
import { Clock, CalendarCheck, CalendarX, CalendarClock, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AttendanceForm } from '../components/attendance/AttendanceForm';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useMarkAttendance } from '../hooks/useAttendance';
import { useSelector } from 'react-redux';

export default function Attendance() {
  const { data, isLoading, isError } = useAttendance();
  const { data: statsData } = useAttendanceStats();
  const markMutation = useMarkAttendance();
  
  const { user } = useSelector((state: any) => state.auth);
  
  const [isFormOpen, setIsFormOpen] = useState(false);

  const records = data?.data || [];
  const stats = statsData?.data || { present: 0, absent: 0, late: 0 };

  const handleSelfCheckIn = async () => {
    try {
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0].substring(0, 5);
      await markMutation.mutateAsync({
        employeeId: user?.employeeId,
        date: now.toISOString().split('T')[0],
        checkIn: timeString,
        status: 'Present',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelfCheckOut = async () => {
    try {
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0].substring(0, 5);
      await markMutation.mutateAsync({
        employeeId: user?.employeeId,
        date: now.toISOString().split('T')[0],
        checkOut: timeString,
        status: 'Present',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: 'employeeId',
      header: 'Employee',
      cell: ({ row }) => {
        const emp = row.original.employeeId;
        return <div className="font-medium">{typeof emp === 'object' && emp ? emp.name : 'Unknown'}</div>;
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        return <div>{new Date(row.getValue('date')).toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: 'checkIn',
      header: 'Check In',
    },
    {
      accessorKey: 'checkOut',
      header: 'Check Out',
      cell: ({ row }) => row.getValue('checkOut') || '-',
    },
    {
      accessorKey: 'workingHours',
      header: 'Hours',
      cell: ({ row }) => {
        const hours = row.getValue('workingHours');
        return hours ? `${hours} hrs` : '-';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let color = 'bg-gray-100 text-gray-800';
        if (status === 'Present') color = 'bg-green-100 text-green-800 hover:bg-green-100';
        if (status === 'Absent') color = 'bg-red-100 text-red-800 hover:bg-red-100';
        if (status === 'Late') color = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
        if (status === 'Half Day') color = 'bg-blue-100 text-blue-800 hover:bg-blue-100';
        
        return <Badge className={color} variant="outline">{status}</Badge>;
      },
    },
  ];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading attendance...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load attendance.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-1">Track employee daily attendance and working hours.</p>
        </div>

        <div className="flex gap-2">
          {user?.role !== 'Super Admin' && (
            <>
              <Button onClick={handleSelfCheckIn} variant="default" className="gap-2 bg-green-600 hover:bg-green-700">
                <Clock className="w-4 h-4" /> Check In
              </Button>
              <Button onClick={handleSelfCheckOut} variant="secondary" className="gap-2">
                <Clock className="w-4 h-4" /> Check Out
              </Button>
            </>
          )}

          {['Super Admin', 'HR Manager'].includes(user?.role) && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserCheck className="w-4 h-4" /> Mark Manual
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Mark Attendance</DialogTitle>
                </DialogHeader>
                <AttendanceForm onSuccess={() => setIsFormOpen(false)} onCancel={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CalendarCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <CalendarX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Today</CardTitle>
            <CalendarClock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.late || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <DataTable 
          columns={columns} 
          data={records} 
          searchKey="employeeId" 
          searchPlaceholder="Search by employee..."
        />
      </div>
    </div>
  );
}