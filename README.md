# FCM Test Project

A minimal functional project to test Firebase Cloud Messaging (FCM) with Django backend and React frontend.

## 🔧 Tech Stack

- **Backend**: Django (Python) with Firebase Admin SDK
- **Frontend**: React (JavaScript) with Firebase SDK
- **Push Notifications**: Firebase Cloud Messaging (FCM)

## 📋 Prerequisites

1. **Python 3.8+** and **Node.js 16+** installed
2. **Firebase Project Setup**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Cloud Messaging
   - Generate a service account private key (JSON file)
   - Get your web app configuration and VAPID key

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

**For Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```cmd
setup.bat
```

### Option 2: Manual Setup

#### 1. Backend Setup (Django)

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate
```

#### 2. Frontend Setup (React)

```bash
# Install dependencies
npm install
```

## ⚙️ Configuration

### 1. Firebase Configuration

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Cloud Messaging

2. **Get Service Account Key**:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-service-account.json` in the `backend/` directory

3. **Get Web App Config**:
   - Go to Project Settings > General
   - Add a web app if you haven't already
   - Copy the Firebase configuration object

4. **Get VAPID Key**:
   - Go to Project Settings > Cloud Messaging
   - In the "Web configuration" section, generate a key pair
   - Copy the VAPID key

### 2. Environment Variables

#### Backend Configuration
```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit backend/.env
FIREBASE_CREDENTIALS_PATH=firebase-service-account.json
```

#### Frontend Configuration
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Firebase config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### 3. Service Worker Configuration

Update `public/firebase-messaging-sw.js` with your actual Firebase configuration:

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

### Start Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver
```
Backend will run on: http://localhost:8000

### Start Frontend (Terminal 2)
```bash
npm run dev
```
Frontend will run on: http://localhost:5173

## 🧪 Testing FCM

1. **Open the application** in your browser (http://localhost:5173)
2. **Enable notifications** when prompted by the browser
3. **Send a test notification** using the form in the app
4. **Test background notifications** by minimizing the browser tab and sending another notification

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

## 🎯 Features

- ✅ Send notifications from Django backend
- ✅ Receive notifications in React frontend (foreground & background)
- ✅ Toast notifications for foreground messages
- ✅ Browser notifications for background messages
- ✅ Notification logging in backend
- ✅ Display notification history in frontend
- ✅ Simple form to send test notifications

## 📁 Project Structure

```
fcm-test-project/
├── backend/                    # Django backend
│   ├── fcm_test/              # Django project
│   ├── notifications/         # Django app
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── manage.py             # Django management script
├── src/                       # React frontend source
├── public/                    # Static files
│   └── firebase-messaging-sw.js  # Service worker
├── .env.example              # Frontend environment template
├── package.json              # Node.js dependencies
├── setup.sh                  # Linux/Mac setup script
├── setup.bat                 # Windows setup script
└── README.md                 # This file
```

## 🔍 Troubleshooting

### Common Issues

1. **"ModuleNotFoundError" in Python**:
   - Make sure virtual environment is activated
   - Run `pip install -r requirements.txt` again

2. **Notifications not working**:
   - Check browser console for errors
   - Ensure Firebase config is correct in both `.env` and service worker
   - Verify notification permissions are granted
   - Check that service worker is registered

3. **CORS issues**:
   - Ensure both servers are running on the correct ports
   - Django CORS is configured for all origins in development

4. **Firebase errors**:
   - Verify Firebase project has Cloud Messaging enabled
   - Check service account key file exists and is valid
   - Ensure VAPID key is correct and matches your Firebase project

### Development Notes

- This is a development setup with relaxed security settings
- For production, implement proper CORS, authentication, and security measures
- Service worker must be served over HTTPS in production
- Notification permissions are required for FCM to work

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes. Use at your own discretion.