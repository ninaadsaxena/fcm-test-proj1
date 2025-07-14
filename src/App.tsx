import React from 'react';
import { Bell, MessageSquare, Server } from 'lucide-react';
import { useNotifications } from './hooks/useNotifications';
import NotificationForm from './components/NotificationForm';
import NotificationList from './components/NotificationList';
import Toast from './components/Toast';

function App() {
  const {
    fcmToken,
    permissionStatus,
    notifications,
    toast,
    setToast,
    requestPermission,
    sendNotification,
  } = useNotifications();

  const getPermissionBadge = () => {
    const badgeClass = {
      granted: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      default: 'bg-yellow-100 text-yellow-800',
    }[permissionStatus] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {permissionStatus}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FCM Test App</h1>
                <p className="text-sm text-gray-500">Firebase Cloud Messaging Demo</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Permission:</span>
                {getPermissionBadge()}
              </div>
              {permissionStatus !== 'granted' && (
                <button
                  onClick={requestPermission}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Enable Notifications
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Server className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Backend Status</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Django Server:</span>
                <span className="text-green-600 font-medium">Ready</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Firebase Admin:</span>
                <span className="text-green-600 font-medium">Configured</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">FCM Status</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Worker:</span>
                <span className="text-green-600 font-medium">Registered</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">FCM Token:</span>
                <span className={fcmToken ? "text-green-600" : "text-yellow-600"}>
                  {fcmToken ? "Generated" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Form */}
        <NotificationForm onSendNotification={sendNotification} />

        {/* Notification List */}
        <NotificationList notifications={notifications} />
      </main>

      {/* Toast Notification */}
      <Toast notification={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;