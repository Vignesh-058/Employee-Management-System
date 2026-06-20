import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Download, Calendar as CalendarIcon, Users, Wallet } from 'lucide-react';

export default function Reports() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setIsExporting(type);
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/${type}/export`;
      
      // We do a direct window.open or fetch and blob download
      // Since it requires authentication, we must use fetch with credentials
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure we pass token if needed
        }
      });
      
      if (!response.ok) throw new Error('Failed to download');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports Center</h1>
        <p className="text-muted-foreground mt-1">Generate and export organizational data reports.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Attendance Report Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle>Attendance Report</CardTitle>
            <CardDescription>Comprehensive daily attendance logs including check-in/out times.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full gap-2" 
              onClick={() => handleExport('attendance')}
              disabled={isExporting === 'attendance'}
            >
              <Download className="w-4 h-4" /> 
              {isExporting === 'attendance' ? 'Generating CSV...' : 'Download CSV'}
            </Button>
          </CardContent>
        </Card>

        {/* Payroll Report Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle>Payroll Report</CardTitle>
            <CardDescription>Financial summary of basic salaries, bonuses, and net disbursements.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full gap-2 bg-green-600 hover:bg-green-700" 
              onClick={() => handleExport('payroll')}
              disabled={isExporting === 'payroll'}
            >
              <Download className="w-4 h-4" /> 
              {isExporting === 'payroll' ? 'Generating CSV...' : 'Download CSV'}
            </Button>
          </CardContent>
        </Card>

        {/* Employee Report Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <CardTitle>Employee Roster</CardTitle>
            <CardDescription>Complete listing of all active and inactive employees.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full gap-2 bg-purple-600 hover:bg-purple-700" 
              onClick={() => alert('Employee export coming soon')}
              disabled={true}
            >
              <FileText className="w-4 h-4" /> Export as PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}