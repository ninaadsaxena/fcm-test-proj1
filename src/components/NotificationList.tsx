import React from 'react';
import { Bell, Clock } from 'lucide-react';

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  timestamp: string;
}

interface NotificationListProps {
  notifications: NotificationItem[];
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Recent Notifications
      </h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No notifications yet</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                <div className="flex items-center text-sm text-gray-500 gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimestamp(notification.timestamp)}
                </div>
              </div>
              <p className="text-gray-700">{notification.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;