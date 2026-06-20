import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { PayrollRecord, PayrollInput } from '../types/payroll.types';

export const usePayrolls = () => {
  return useQuery<{ data: PayrollRecord[], pagination: any }>({
    queryKey: ['payrolls'],
    queryFn: async () => {
      const res = await api.get('/payroll');
      return res.data;
    }
  });
};

export const useCreatePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PayrollInput) => {
      const res = await api.post('/payroll', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      queryClient.invalidateQueries({ queryKey: ['payrolls', 'stats'] });
    }
  });
};

export const usePayrollStats = () => {
  return useQuery<{ success: boolean, data: any }>({
    queryKey: ['payrolls', 'stats'],
    queryFn: async () => {
      const res = await api.get('/payroll/stats');
      return res.data;
    }
  });
};
