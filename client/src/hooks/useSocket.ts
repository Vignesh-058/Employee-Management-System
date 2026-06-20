import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    // Create socket connection
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
    }

    socketRef.current = socketInstance;

    const socket = socketRef.current;

    // Real-time notification handler
    socket.on('notification:new', (_notification: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    // Attendance updates
    socket.on('attendance:update', () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'attendance'] });
    });

    // Employee updates
    socket.on('employee:update', () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
    });

    // Leave status updates
    socket.on('leave:statusUpdate', () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'leave'] });
    });

    // Dashboard metrics refresh
    socket.on('dashboard:refresh', () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    });

    return () => {
      socket.off('notification:new');
      socket.off('attendance:update');
      socket.off('employee:update');
      socket.off('leave:statusUpdate');
      socket.off('dashboard:refresh');
    };
  }, [token, queryClient]);

  return socketRef.current;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
