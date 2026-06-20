import { useState } from 'react';
import { usePayrolls, usePayrollStats } from '../hooks/usePayroll';
import { PayrollRecord } from '../types/payroll.types';
import { DataTable } from '../components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../components/ui/button';
import { Plus, Download, DollarSign, Wallet, PiggyBank, ReceiptText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { PayrollForm } from '../components/payroll/PayrollForm';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { generatePayslipPDF } from '../components/payroll/PayslipGenerator';
import { useSelector } from 'react-redux';

export default function Payroll() {
  const { data, isLoading, isError } = usePayrolls();
  const { data: statsData } = usePayrollStats();
  
  const { user } = useSelector((state: any) => state.auth);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const records = data?.data || [];
  const stats = statsData?.data || { totalPayroll: 0, highestSalary: 0, averageSalary: 0 };

  const columns: ColumnDef<PayrollRecord>[] = [
    {
      accessorKey: 'employeeId',
      header: 'Employee',
      cell: ({ row }) => {
        const emp = row.original.employeeId;
        return (
          <div>
            <div className="font-medium">{typeof emp === 'object' && emp ? emp.name : 'Unknown'}</div>
            <div className="text-xs text-muted-foreground">{typeof emp === 'object' && emp ? emp.email : ''}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'month',
      header: 'Month',
      cell: ({ row }) => <div className="font-medium">{row.getValue('month')} {row.original.year}</div>,
    },
    {
      accessorKey: 'netSalary',
      header: 'Net Salary',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('netSalary') || '0');
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
        return <div className="font-bold text-green-600">{formatted}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge className={status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} variant="outline">
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Payslip',
      cell: ({ row }) => {
        return (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => generatePayslipPDF(row.original)}>
            <Download className="w-4 h-4" /> PDF
          </Button>
        );
      },
    },
  ];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading payroll data...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load payroll data.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground mt-1">Manage employee salaries, deductions, and payslips.</p>
        </div>

        {['Super Admin', 'HR Manager'].includes(user?.role) && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Generate Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Generate Payroll Record</DialogTitle>
              </DialogHeader>
              <PayrollForm onSuccess={() => setIsFormOpen(false)} onCancel={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalPayroll / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground">Across all generated payrolls</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.averageSalary?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Salary</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.highestSalary?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
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