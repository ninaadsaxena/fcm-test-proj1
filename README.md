# FCM Test Project

A complete Firebase Cloud Messaging (FCM) implementation with Django REST API backend and React frontend. Test push notifications in both foreground and background modes.

## 🔧 Tech Stack

- **Backend**: Django 4.2 + Django REST Framework + Firebase Admin SDK
- **Frontend**: React 18 + Vite + Tailwind CSS + Firebase SDK
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Database**: SQLite (development)

## 📋 Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **Firebase Project** with Cloud Messaging enabled

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

**For Linux/Mac:**
```bash
git clone <your-repo-url>
cd fcm-test-project
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```cmd
git clone <your-repo-url>
cd fcm-test-project
setup.bat
```

### Option 2: Manual Setup

#### 1. Backend Setup

```bash
# Backend setup
cd backend
python3 -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate

# Return to root directory
cd ..
```

#### 2. Frontend Setup

```bash
# Install frontend dependencies (from root directory)
npm install
```

## ⚙️ Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Cloud Messaging** in the project settings

### 2. Get Firebase Configuration

#### Web App Configuration:
1. Go to Project Settings → General
2. Add a web app (if not already added)
3. Copy the Firebase configuration object

#### Service Account Key:
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Save it as `firebase-service-account.json` in the `backend/` directory

#### VAPID Key:
1. Go to Project Settings → Cloud Messaging
2. In "Web configuration", generate a key pair
3. Copy the VAPID key

### 3. Environment Configuration

#### Frontend Configuration
Create `.env` file in the root directory (same level as package.json):
```bash
cp .env.example .env
```

Edit `.env` with your Firebase config:
```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key-here
```

#### Backend Configuration
Create `backend/.env` file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
FIREBASE_CREDENTIALS_PATH=firebase-service-account.json
```

#### Service Worker Configuration
The service worker is already configured in `public/firebase-messaging-sw.js`. You just need to update it with your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 🏃‍♂️ Running the Application

### Start Backend Server (Terminal 1)
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver
```
✅ Backend runs on: http://localhost:8000

### Start Frontend Server (Terminal 2)
```bash
# From root directory
npm run dev
```
✅ Frontend runs on: http://localhost:5173

## 🧪 Testing FCM Notifications

1. **Open the app** at http://localhost:5173
2. **Allow notifications** when prompted by the browser
3. **Send test notification** using the form
4. **Test background notifications**:
   - Minimize or switch to another tab
   - Send another notification
   - You should see a browser notification

## 📡 API Documentation

### Backend Endpoints (http://localhost:8000/api/)

#### Send Notification
```http
POST /api/send-notification/
Content-Type: application/json

{
  "title": "Test Notification",
  "body": "This is a test message",
  "topic": "all"
}
```

**Response:**
```json
{
  "success": true,
  "message_id": "projects/your-project/messages/0:1234567890"
}
```

#### Get Notifications History
```http
GET /api/notifications/
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Test Notification",
    "body": "This is a test message",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

## 🎯 Features

- ✅ **Send notifications** from Django backend via REST API
- ✅ **Receive notifications** in React frontend (foreground & background)
- ✅ **Toast notifications** for foreground messages
- ✅ **Browser notifications** for background messages
- ✅ **Notification logging** and history in backend database
- ✅ **Real-time notification list** in frontend
- ✅ **Permission management** with status indicators
- ✅ **Responsive design** with Tailwind CSS
- ✅ **Topic-based messaging** support

## 📁 Project Structure

```
fcm-test-project/
├── backend/                          # Django backend
│   ├── fcm_test/                     # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py              # Django configuration
│   │   ├── urls.py                  # URL routing
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── notifications/                # Django app for FCM
│   │   ├── models.py                # NotificationLog model
│   │   ├── views.py                 # API endpoints
│   │   ├── serializers.py           # DRF serializers
│   │   ├── urls.py                  # App URL routing
│   │   ├── admin.py                 # Django admin config
│   │   └── migrations/              # Database migrations
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Backend environment template
│   ├── manage.py                    # Django management
│   └── firebase-service-account.json  # (You add this)
├── src/                              # React frontend source
│   ├── components/                   # React components
│   │   ├── NotificationForm.jsx     # Send notification form
│   │   ├── NotificationList.jsx     # Display notifications
│   │   └── Toast.jsx                # Toast notifications
│   ├── hooks/                       # Custom React hooks
│   │   └── useNotifications.js      # FCM logic hook
│   ├── firebase-config.js           # Firebase initialization
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # React entry point
│   └── index.css                    # Tailwind styles
├── public/                          # Static files
│   ├── firebase-messaging-sw.js    # Service worker (update with your config)
│   ├── icon-192x192.png            # Notification icon
│   └── badge-72x72.png             # Notification badge
├── .env.example                     # Frontend environment template
├── package.json                     # Node.js dependencies
├── vite.config.ts                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
├── setup.sh                        # Linux/Mac setup script
├── setup.bat                       # Windows setup script
└── README.md                        # This file
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Python/Django Issues
```bash
# ModuleNotFoundError
cd backend
source venv/bin/activate  # Ensure virtual env is active
pip install -r requirements.txt

# Database issues
python manage.py migrate
```

#### 2. Firebase Configuration Issues
```bash
# Check your configuration files:
# - .env (frontend config)
# - backend/.env (backend config)  
# - public/firebase-messaging-sw.js (service worker config)
# - backend/firebase-service-account.json (service account)
```

#### 3. Notification Permission Issues
- Ensure HTTPS in production (required for notifications)
- Check browser console for permission errors
- Try incognito mode to reset permissions
- Verify VAPID key matches your Firebase project

#### 4. CORS Issues
- Backend CORS is configured for development
- For production, update `CORS_ALLOW_ALL_ORIGINS` in `backend/fcm_test/settings.py`

#### 5. Service Worker Issues
```javascript
// Check in browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

### Development Tips

- **Check browser console** for detailed error messages
- **Use browser dev tools** → Application → Service Workers to debug
- **Test in incognito mode** to reset permissions and cache
- **Verify Firebase project settings** match your configuration
- **Check network tab** for API request/response details

## 🚀 Production Deployment

### Backend (Django)
1. Set `DEBUG = False` in settings.py
2. Configure proper database (PostgreSQL recommended)
3. Set up proper CORS origins
4. Use environment variables for sensitive data
5. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend (React)
1. Build the project: `npm run build`
2. Deploy `dist/` folder to Netlify, Vercel, or similar
3. Ensure HTTPS (required for notifications)
4. Update API URLs to production backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and testing purposes. Use at your own discretion.

---

**Need help?** Check the troubleshooting section or open an issue on GitHub.