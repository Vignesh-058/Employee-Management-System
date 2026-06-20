import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { ArrowLeft, User, Mail, Phone, Building2, Briefcase, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';

export const EmployeeDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const res = await api.get(`/employees/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading employee profile...</div>;
  if (!employee) return <div className="p-8 text-center text-destructive">Employee not found</div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'documents', label: 'Documents' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/employees" className="p-2 hover:bg-accent rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Employee Profile</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit2 className="w-4 h-4" /> Edit
          </Button>
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center text-primary text-3xl font-bold">
              {employee.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-foreground">{employee.name}</h3>
            <p className="text-muted-foreground">{employee.designation}</p>
            <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              {employee.status}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h4 className="font-semibold text-foreground mb-4">Contact Information</h4>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{employee.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{employee.phone}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm">
            <div className="flex border-b border-border px-4 pt-4 gap-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg text-foreground mb-4">Employment Details</h4>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                        <User className="w-4 h-4" /> Employee ID
                      </p>
                      <p className="font-medium text-foreground">{employee.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4" /> Department
                      </p>
                      <p className="font-medium text-foreground">{employee.department?.departmentName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                        <Briefcase className="w-4 h-4" /> Designation
                      </p>
                      <p className="font-medium text-foreground">{employee.designation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" /> Joining Date
                      </p>
                      <p className="font-medium text-foreground">
                        {new Date(employee.joiningDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'attendance' && <div className="text-muted-foreground">Attendance records will appear here.</div>}
              {activeTab === 'payroll' && <div className="text-muted-foreground">Payroll history will appear here.</div>}
              {activeTab === 'documents' && <div className="text-muted-foreground">Uploaded documents will appear here.</div>}
              {activeTab === 'activity' && <div className="text-muted-foreground">Recent activity logs will appear here.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};