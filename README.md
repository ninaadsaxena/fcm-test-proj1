# FCM Test Project

A minimal functional project to test Firebase Cloud Messaging (FCM) with Django backend and React frontend.

## 🔧 Tech Stack

- **Backend**: Django (Python) with Firebase Admin SDK
- **Frontend**: React (JavaScript) with Firebase SDK
- **Push Notifications**: Firebase Cloud Messaging (FCM)

## 📋 Prerequisites

1. **Firebase Project Setup**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Cloud Messaging
   - Generate a service account private key (JSON file)
   - Get your web app configuration and VAPID key

2. **Python 3.8+** and **Node.js 16+** installed

## 🚀 Setup Instructions

### 1. Backend Setup (Django)

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies (already done if you followed the artifact)
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your Firebase service account JSON file
# Download from Firebase Console > Project Settings > Service Accounts
# Save as 'firebase-service-account.json' in the backend directory

# Update .env file
FIREBASE_CREDENTIALS_PATH=firebase-service-account.json

# Run migrations (already done if you followed the artifact)
python manage.py makemigrations
python manage.py migrate

# Start Django server
python manage.py runserver
```

### 2. Frontend Setup (React)

```bash
# Install dependencies (already done if you followed the artifact)
npm install firebase

# Create .env file
cp .env.example .env

# Update .env with your Firebase config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key

# Update service worker with your Firebase config
# Edit public/firebase-messaging-sw.js with your actual config

# Start React development server
npm run dev
```

## 🧪 Testing FCM

1. **Start both servers**:
   - Django: `python manage.py runserver` (http://localhost:8000)
   - React: `npm run dev` (http://localhost:5173)

2. **Enable notifications** in the browser when prompted

3. **Send a test notification**:
   - Fill out the form in the React app
   - Click "Send Notification"
   - You should see the notification appear as a toast in the browser

4. **Test background notifications**:
   - Minimize or switch to another tab
   - Send another notification
   - You should see a browser notification

## 📡 API Endpoints

### Backend (Django) - http://localhost:8000/api/

- `POST /send-notification/` - Send FCM notification
  ```json
  {
    "title": "Test Notification",
    "body": "This is a test message",
    "topic": "all"
  }
  ```

- `GET /notifications/` - Get last 10 notifications

## 🔧 Configuration Files

### Backend Configuration
- `backend/.env` - Environment variables
- `backend/firebase-service-account.json` - Firebase service account key

### Frontend Configuration
- `.env` - Firebase web app config and VAPID key
- `public/firebase-messaging-sw.js` - Service worker for background notifications

## 🎯 Features

- ✅ Send notifications from Django backend
- ✅ Receive notifications in React frontend (foreground & background)
- ✅ Toast notifications for foreground messages
- ✅ Browser notifications for background messages
- ✅ Notification logging in backend
- ✅ Display notification history in frontend
- ✅ Simple form to send test notifications

## 🔍 Troubleshooting

1. **Notifications not working**:
   - Check browser console for errors
   - Ensure Firebase config is correct
   - Verify service worker is registered
   - Check notification permissions

2. **CORS issues**:
   - Django CORS is configured for all origins in development
   - Ensure both servers are running on specified ports

3. **Firebase errors**:
   - Verify Firebase project has Cloud Messaging enabled
   - Check service account key file exists and is valid
   - Ensure VAPID key is correct

## 📝 Notes

- This is a development setup with relaxed security settings
- For production, implement proper CORS, authentication, and security measures
- Service worker must be served over HTTPS in production
- Notification permissions are required for FCM to work