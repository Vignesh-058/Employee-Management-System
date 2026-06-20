import Notification from '../models/Notification';
import { emitToUser } from '../socket/socket';

class NotificationService {
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    link?: string;
  }) {
    const notification = await Notification.create({
      user: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      link: data.link || null,
    });

    // Real-time push via Socket.IO
    try {
      emitToUser(data.userId, 'notification:new', notification);
    } catch (_e) {
      // Socket.IO may not be initialized in test environments — silent fail
    }

    return notification;
  }

  async createBulkNotification(userIds: string[], data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    link?: string;
  }) {
    const notifications = await Notification.insertMany(
      userIds.map(userId => ({
        user: userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        link: data.link || null,
      }))
    );

    // Emit to each user
    userIds.forEach((userId, i) => {
      try {
        emitToUser(userId, 'notification:new', notifications[i]);
      } catch (_e) {
        // silent fail
      }
    });

    return notifications;
  }
}

export const notificationService = new NotificationService();
