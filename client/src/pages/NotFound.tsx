import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved. 
        Please check the URL or navigate back to safety.
      </p>
      <Link to="/dashboard">
        <Button size="lg" className="gap-2">
          <Home className="w-5 h-5" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
