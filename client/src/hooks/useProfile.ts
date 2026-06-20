import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import api from '../lib/axios';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string; department?: string }) => {
      const res = await api.put('/auth/profile', data);
      return res.data;
    },
    onSuccess: (data) => {
      // Update redux state with new user info
      dispatch(setCredentials({
        user: data.data,
        token: localStorage.getItem('token') || ''
      }));
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put('/auth/updatepassword', data);
      return res.data;
    }
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    },
    onSuccess: (data) => {
      // Update redux state with new user info including avatar
      dispatch(setCredentials({
        user: data.data,
        token: localStorage.getItem('token') || ''
      }));
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
};
