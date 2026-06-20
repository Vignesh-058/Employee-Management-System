import { useState } from 'react';
import { useDepartments, useDeleteDepartment } from '../hooks/useDepartments';
import { Department } from '../types/department.types';
import { DataTable } from '../components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../components/ui/button';
import { Plus, Edit, Trash2, Building2, Users, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DepartmentForm } from '../components/departments/DepartmentForm';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function Departments() {
  const { data, isLoading, isError } = useDepartments();
  const deleteMutation = useDeleteDepartment();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const departments = data?.data || [];

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDept(null);
  };

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: 'departmentName',
      header: 'Department Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('departmentName')}</div>,
    },
    {
      accessorKey: 'manager',
      header: 'Manager',
      cell: ({ row }) => {
        const manager = row.original.manager;
        return <div>{typeof manager === 'object' && manager ? manager.name : 'Not Assigned'}</div>;
      },
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('budget') || '0');
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        return <div>{new Date(row.getValue('createdAt')).toLocaleDateString()}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
              <Edit className="w-4 h-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original._id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading departments...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load departments.</div>;

  const totalBudget = departments.reduce((acc, dept) => acc + (dept.budget || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage your organization's departments and budgets.</p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingDept(null);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingDept ? 'Edit Department' : 'Create Department'}</DialogTitle>
            </DialogHeader>
            <DepartmentForm 
              initialData={editingDept} 
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalBudget / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Allocated across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Managers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.filter(d => d.manager).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <DataTable 
          columns={columns} 
          data={departments} 
          searchKey="departmentName" 
          searchPlaceholder="Search departments..."
        />
      </div>
    </div>
  );
}