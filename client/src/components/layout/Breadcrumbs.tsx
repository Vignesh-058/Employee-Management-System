import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4">
      <Link to="/dashboard" className="flex items-center hover:text-primary transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const title = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

        return (
          <div key={to} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2" />
            {last ? (
              <span className="font-medium text-foreground">{title}</span>
            ) : (
              <Link to={to} className="hover:text-primary transition-colors">
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
