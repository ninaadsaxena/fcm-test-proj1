import React, { useState } from 'react';
import { Bug, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DebugInfo {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: string;
}

interface DebugPanelProps {
  fcmToken: string | null;
  permissionStatus: NotificationPermission;
}

interface FirebaseGlobal {
  app?: { name?: string };
  messaging?: unknown;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ fcmToken, permissionStatus }) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const addDebugInfo = (message: string, type: DebugInfo['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, { message, type, timestamp }]);
  };

  const testNotificationAPI = async () => {
    addDebugInfo('Testing notification API...', 'info');
    
    try {
      const response = await fetch('http://localhost:8000/api/send-notification/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Debug Test',
          body: 'Testing notification system',
          topic: 'all'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addDebugInfo(`✅ API Success: ${data.message_id}`, 'success');
      } else {
        addDebugInfo(`❌ API Error: ${response.status}`, 'error');
      }
    } catch (error) {
      addDebugInfo(`❌ Network Error: ${(error as Error).message}`, 'error');
    }
  };

  const testBrowserNotification = () => {
    addDebugInfo('Testing browser notification...', 'info');
    
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('Test Notification', {
          body: 'This is a test browser notification',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'debug-test-notification',
          requireInteraction: false
        });
        
        addDebugInfo('✅ Browser notification created', 'success');
        
        setTimeout(() => {
          notification.close();
        }, 5000);
        
      } catch (error) {
        addDebugInfo(`❌ Browser notification failed: ${(error as Error).message}`, 'error');
      }
    } else {
      addDebugInfo(`❌ Permission not granted: ${Notification.permission}`, 'error');
    }
  };

  const testServiceWorker = async () => {
    addDebugInfo('Checking service worker...', 'info');
    
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        addDebugInfo(`Service Workers: ${registrations.length} found`, 'info');
        
        registrations.forEach((reg, index) => {
          addDebugInfo(`SW ${index + 1}: ${reg.scope}`, 'info');
        });
        
        if (registrations.length === 0) {
          addDebugInfo('❌ No service worker registered!', 'error');
        }
      } catch (error) {
        addDebugInfo(`❌ SW Error: ${(error as Error).message}`, 'error');
      }
    } else {
      addDebugInfo('❌ Service Worker not supported', 'error');
    }
  };

  const testFirebaseMessaging = () => {
    addDebugInfo('Testing Firebase Messaging...', 'info');
    
    // Check environment variables first
    const envVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_VAPID_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];
    
    let missingEnvVars = 0;
    envVars.forEach(varName => {
      const value = import.meta.env[varName];
      if (!value) {
        addDebugInfo(`${varName}: ❌ Missing`, 'error');
        missingEnvVars++;
      } else {
        addDebugInfo(`${varName}: ✅ Set`, 'success');
      }
    });
    
    if (missingEnvVars > 0) {
      addDebugInfo(`❌ ${missingEnvVars} environment variables missing`, 'error');
      addDebugInfo('Create .env file with your Firebase config', 'warning');
      return;
    }
    
    // Check if Firebase messaging is available
    const firebaseGlobal = (window as any).firebase;
    if (firebaseGlobal?.app) {
      addDebugInfo('✅ Firebase app initialized', 'success');
    } else {
      addDebugInfo('❌ Firebase app not initialized', 'error');
      return;
    }
    
    if (firebaseGlobal?.messaging) {
      addDebugInfo('✅ Firebase messaging initialized', 'success');
      
      // Test onMessage function availability
      try {
        const { onMessage } = await import('../firebase-config');
        if (typeof onMessage === 'function') {
          addDebugInfo('✅ onMessage function available', 'success');
        } else {
          addDebugInfo('❌ onMessage function not available', 'error');
        }
      } catch (importError) {
        addDebugInfo(`❌ Failed to import onMessage: ${importError}`, 'error');
      }
    } else {
      addDebugInfo('❌ Firebase messaging not initialized', 'error');
      addDebugInfo('Check browser console for initialization errors', 'warning');
      return;
    }

    // Check FCM token
    if (fcmToken) {
      addDebugInfo(`✅ FCM Token: ${fcmToken.substring(0, 20)}...`, 'success');
      addDebugInfo(`Token length: ${fcmToken.length}`, 'info');
    } else {
      addDebugInfo('❌ No FCM Token generated', 'error');
      addDebugInfo('Try clicking "Enable Notifications" first', 'warning');
    }

    // Check permission
    addDebugInfo(`Permission: ${permissionStatus}`, permissionStatus === 'granted' ? 'success' : 'error');
  };

  const testServiceWorkerReload = async () => {
    addDebugInfo('Reloading service worker...', 'info');
    
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        // Unregister existing service workers
        for (const registration of registrations) {
          await registration.unregister();
          addDebugInfo(`Unregistered: ${registration.scope}`, 'info');
        }
        
        // Re-register the service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        addDebugInfo('✅ Service worker re-registered', 'success');
        
        // Wait for it to be ready
        await navigator.serviceWorker.ready;
        addDebugInfo('✅ Service worker is ready', 'success');
        
      } catch (error) {
        addDebugInfo(`❌ Service worker reload failed: ${(error as Error).message}`, 'error');
      }
    }
  };

  const clearDebug = () => {
    setDebugInfo([]);
  };

  const getIcon = (type: DebugInfo['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 z-50"
        title="Debug Notifications"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md z-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Debug Panel
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close debug panel"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={testFirebaseMessaging}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
        >
          Test Firebase Setup
        </button>
        <button
          onClick={testServiceWorker}
          className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
        >
          Test Service Worker
        </button>
        <button
          onClick={testNotificationAPI}
          className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
        >
          Test API Call
        </button>
        <button
          onClick={testBrowserNotification}
          className="w-full bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700"
        >
          Test Browser Notification
        </button>
        <button
          onClick={testServiceWorkerReload}
          className="w-full bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
        >
          Reload Service Worker
        </button>
        <button
          onClick={clearDebug}
          className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
        >
          Clear Log
        </button>
      </div>

      <div className="space-y-1 text-xs">
        {debugInfo.map((info, index) => (
          <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
            {getIcon(info.type)}
            <div className="flex-1">
              <div className="text-gray-800">{info.message}</div>
              <div className="text-gray-500">{info.timestamp}</div>
            </div>
          </div>
        ))}
        {debugInfo.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            Click buttons above to run tests
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;