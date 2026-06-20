import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import ProtectedRoute from '../../components/ProtectedRoute';

// Mock Redux hooks to simulate different roles
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

import { useSelector } from 'react-redux';

const MockPage = ({ title }: { title: string }) => <div>{title}</div>;

const renderWithRouter = (initialRoute: string) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/login" element={<MockPage title="Login Page" />} />
          <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'HR Manager']} />}>
            <Route path="/payroll" element={<MockPage title="Payroll Page" />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<MockPage title="Dashboard Page" />} />
          </Route>
          <Route path="*" element={<MockPage title="404 Not Found" />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('Routing Architecture', () => {
  it('redirects unauthenticated users to login', () => {
    (useSelector as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    renderWithRouter('/dashboard');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('allows authenticated users to access dashboard', () => {
    (useSelector as any).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'Employee' },
      loading: false,
    });

    renderWithRouter('/dashboard');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('blocks Employee from accessing HR restricted routes', () => {
    (useSelector as any).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'Employee' },
      loading: false,
    });

    renderWithRouter('/payroll');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument(); // Redirects to dashboard
  });

  it('allows HR Manager to access payroll', () => {
    (useSelector as any).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'HR Manager' },
      loading: false,
    });

    renderWithRouter('/payroll');
    expect(screen.getByText('Payroll Page')).toBeInTheDocument();
  });

  it('renders 404 for invalid routes', () => {
    (useSelector as any).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'Super Admin' },
      loading: false,
    });

    renderWithRouter('/invalid-route-123');
    expect(screen.getByText('404 Not Found')).toBeInTheDocument();
  });
});
