import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../hooks/useNotifications';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Bell, Check, Trash2, Info, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const { data, isLoading, isError } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = data?.data || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading notifications...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load notifications.</div>;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-8 h-8" /> Notifications
          </h1>
          <p className="text-muted-foreground mt-1">You have {unreadCount} unread messages.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAllAsReadMutation.mutateAsync()} className="gap-2">
            <Check className="w-4 h-4" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p>You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification._id} 
              className={`transition-all ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900 shadow-sm' : 'opacity-75'}`}
            >
              <CardContent className="p-4 flex gap-4">
                <div className="mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${!notification.isRead ? 'text-blue-900 dark:text-blue-100' : ''}`}>
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex flex-col gap-2 justify-start items-end">
                  {!notification.isRead && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAsReadMutation.mutateAsync(notification._id)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      Mark as read
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteMutation.mutateAsync(notification._id)}
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}