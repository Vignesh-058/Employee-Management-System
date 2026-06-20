import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store/store';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-card border-b border-border sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="md:hidden p-2 text-muted-foreground hover:bg-accent rounded-md">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground hidden sm:block">Welcome back, {user?.name}</h2>
        {user?.role !== 'Employee' && (
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground tracking-wider rounded-full shadow-sm">
            {user?.role?.toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <Link to="/notifications" className="p-2 text-muted-foreground transition-colors rounded-full hover:bg-accent hover:text-accent-foreground">
          <Bell className="w-5 h-5" />
        </Link>
        <Link to="/profile" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">{user?.name}</span>
        </Link>
        <button
          onClick={() => dispatch(logout())}
          className="p-2 text-destructive transition-colors rounded-full hover:bg-destructive/10"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
