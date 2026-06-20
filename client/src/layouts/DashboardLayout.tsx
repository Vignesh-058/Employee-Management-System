import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-background/95 text-foreground">
      {/* Sidebar Placeholder */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary tracking-tight">EMS Pro</h2>
        </div>
        <nav className="space-y-2 px-4 mt-6">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/10 text-primary font-medium transition-colors">
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
            Employees
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
            Departments
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
            Attendance
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
            Payroll
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar Placeholder */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
