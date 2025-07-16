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
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized:', app);
  
  messaging = getMessaging(app);
  console.log('✅ Firebase messaging initialized:', messaging);
  console.log('✅ Firebase initialized successfully');
  
  // Make Firebase available globally for debugging
  (window as typeof window & { firebase?: { app: FirebaseApp; messaging: Messaging } }).firebase = { app, messaging };
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  if (error instanceof Error) {
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
  }
}

export { messaging, vapidKey, getToken, onMessage };