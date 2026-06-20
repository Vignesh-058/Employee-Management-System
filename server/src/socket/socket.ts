import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';

let io: SocketIOServer;

export const initializeSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware for Socket.IO
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error'));

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: any) => {
    const userId = socket.user._id.toString();

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Join role-based rooms
    socket.join(`role:${socket.user.role}`);

    socket.on('join:department', (departmentId: string) => {
      socket.join(`dept:${departmentId}`);
    });

    socket.on('disconnect', () => {
      // cleanup
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

// Helper to emit to a specific user
export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

// Helper to emit to all users with a specific role
export const emitToRole = (role: string, event: string, data: any) => {
  if (!io) return;
  io.to(`role:${role}`).emit(event, data);
};

// Helper to emit to everyone
export const emitToAll = (event: string, data: any) => {
  if (!io) return;
  io.emit(event, data);
};

// Helper to emit to a specific department
export const emitToDepartment = (departmentId: string, event: string, data: any) => {
  if (!io) return;
  io.to(`dept:${departmentId}`).emit(event, data);
};
