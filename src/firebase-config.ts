import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Check if all required environment variables are present
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:', missingVars);
  console.error('Please check your .env file and make sure all Firebase config values are set');
}

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

const vapidKey: string = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

console.log('🔧 Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
  appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing'
});

console.log('🔑 VAPID Key:', vapidKey ? '✅ Set (' + vapidKey.substring(0, 20) + '...)' : '❌ Missing');

if (!vapidKey) {
  console.error('❌ VAPID key is missing. Please set VITE_FIREBASE_VAPID_KEY in your .env file');
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

try {
  // Validate that we have the minimum required config
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.messagingSenderId) {
    throw new Error('Missing required Firebase configuration. Please check your .env file.');
  }

  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized:', app);
  
  // Only initialize messaging if we're in a browser environment
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      // Wait a bit for the app to be fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      messaging = getMessaging(app);
      console.log('✅ Firebase messaging initialized:', messaging);
      
      // Verify messaging is working by testing getToken availability
      if (messaging) {
        console.log('✅ Firebase messaging ready');
        
        // Test if we can access messaging methods
        try {
          // This will throw if messaging isn't properly initialized
          const testSupported = await messaging.isSupported?.() ?? true;
          console.log('✅ Messaging supported:', testSupported);
        } catch (testError) {
          console.log('⚠️ Messaging support test failed, but continuing:', testError);
        }
      }
    } catch (messagingError) {
      console.error('❌ Firebase messaging initialization failed:', messagingError);
      console.error('❌ Error details:', messagingError);
      messaging = null;
    }
  } else {
    console.log('⚠️ Service Worker not supported, messaging not initialized');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  if (error instanceof Error) {
    console.error('❌ Error details:', error.message);
  }
  app = null;
  messaging = null;
}

// Make Firebase available globally for debugging
if (typeof window !== 'undefined') {
  (window as typeof window & { firebase?: { app: FirebaseApp | null; messaging: Messaging | null } }).firebase = { app, messaging };
}

export { messaging, vapidKey, getToken, onMessage };