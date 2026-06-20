import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AttendanceRecord, AttendanceInput } from '../types/attendance.types';
import api from '../lib/axios';

export const useAttendance = () => {
  return useQuery<{ data: AttendanceRecord[], pagination: any }>({
    queryKey: ['attendance'],
    queryFn: async () => {
      const res = await api.get('/attendance');
      return res.data;
    }
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AttendanceInput) => {
      const res = await api.post('/attendance', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    }
  });
};

export const useAttendanceStats = () => {
  return useQuery<{ success: boolean, data: any }>({
    queryKey: ['attendance', 'stats'],
    queryFn: async () => {
      const res = await api.get('/attendance/stats');
      return res.data;
    }
  });
};
