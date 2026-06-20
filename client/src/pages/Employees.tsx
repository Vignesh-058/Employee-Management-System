import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  createColumnHelper,
  PaginationState
} from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { Search, Plus, Filter, Edit2, Eye, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';

type Employee = {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  department: { departmentName: string };
  status: string;
};

const columnHelper = createColumnHelper<Employee>();

export const Employees = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['employees', pagination.pageIndex, pagination.pageSize, searchTerm],
    queryFn: async () => {
      const res = await api.get(`/employees`, {
        params: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          ...(searchTerm && { 'name[regex]': searchTerm, 'name[options]': 'i' })
        }
      });
      return res.data;
    }
  });

  const columns = [
    columnHelper.accessor('employeeId', {
      header: 'ID',
      cell: info => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('name', {
      header: 'Employee',
      cell: info => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
            {info.getValue().charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">{info.getValue()}</span>
            <span className="text-xs text-muted-foreground">{info.row.original.email}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('designation', {
      header: 'Designation',
    }),
    columnHelper.accessor('department.departmentName', {
      header: 'Department',
      cell: info => <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">{info.getValue() || 'N/A'}</span>
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          info.getValue() === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
          info.getValue() === 'On Leave' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Link to={`/employees/${row.original._id}`} className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-primary">
            <Eye className="w-4 h-4" />
          </Link>
          <button className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-amber-500">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    })
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    pageCount: data?.pagination?.next ? pagination.pageIndex + 2 : pagination.pageIndex + 1,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Employees</h2>
          <p className="text-muted-foreground">Manage your organization's workforce</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination({ ...pagination, pageIndex: 0 });
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
            />
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 font-medium">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                    Loading employees...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                    No employees found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {table.getState().pagination.pageIndex + 1}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};