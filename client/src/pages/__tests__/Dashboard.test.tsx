import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../../store/store';
import Dashboard from '../Dashboard';

const queryClient = new QueryClient();

const renderWithProviders = (component: any) => {
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe('Dashboard Component', () => {
  it('renders without crashing', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText(/Total Employees/i)).toBeInTheDocument();
  });

  it('displays the KPI cards', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('2,450')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('94%')).toBeInTheDocument();
  });
});
