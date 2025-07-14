import { useState, useEffect } from 'react';
import { messaging, vapidKey, getToken, onMessage } from '../firebase-config';

const BACKEND_URL = 'http://localhost:8000/api';

export const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Request notification permission and get FCM token
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey });
        setFcmToken(token);
        console.log('FCM Token:', token);
        return token;
      }
    } catch (error) {
      console.error('Error getting permission:', error);
    }
    return null;
  };

  // Setup foreground message listener
  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        setToast({
          title: payload.notification.title,
          body: payload.notification.body,
        });
        fetchNotifications(); // Refresh the list
      });

      return unsubscribe;
    }
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/notifications/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      // Set empty array if backend is not available
      setNotifications([]);
    }
  };

  // Send notification via backend
  const sendNotification = async (notificationData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/send-notification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (response.ok) {
        fetchNotifications(); // Refresh the list
        return true;
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };

  // Initial setup
  useEffect(() => {
    requestPermission();
    fetchNotifications();
  }, []);

  return {
    fcmToken,
    permissionStatus,
    notifications,
    toast,
    setToast,
    requestPermission,
    fetchNotifications,
    sendNotification,
  };
};