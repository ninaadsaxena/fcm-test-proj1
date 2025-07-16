import React, { useEffect } from 'react';
import { X, Bell } from 'lucide-react';

const Toast = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      console.log('🍞 Toast notification displayed:', notification);
      
      const timer = setTimeout(() => {
        onClose();
      }, 6000); // Show for 6 seconds

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 bg-white border-l-4 border-blue-500 rounded-lg shadow-xl p-4 max-w-sm z-50 animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-1 rounded-full">
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 focus:outline-none ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-gray-700 text-sm pl-6">{notification.body}</p>
      <div className="mt-2 pl-6">
        <span className="text-xs text-blue-600 font-medium">New notification received</span>
      </div>
    </div>
  );
};

export default Toast;