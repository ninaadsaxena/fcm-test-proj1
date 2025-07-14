@echo off

echo 🚀 Setting up FCM Test Project...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup Backend
echo 📦 Setting up Django backend...
cd backend

REM Create virtual environment
python -m venv venv

REM Activate virtual environment (Windows)
call venv\Scripts\activate.bat

REM Install Python dependencies
pip install -r requirements.txt

REM Run migrations
python manage.py makemigrations
python manage.py migrate

echo ✅ Backend setup complete

REM Setup Frontend
echo 📦 Setting up React frontend...
cd ..

REM Install Node.js dependencies
npm install

echo ✅ Frontend setup complete

echo.
echo 🎉 Setup complete! Next steps:
echo.
echo 1. Create a Firebase project and get your configuration
echo 2. Copy .env.example to .env and fill in your Firebase config
echo 3. Copy backend\.env.example to backend\.env and add your Firebase service account path
echo 4. Download your Firebase service account JSON file to backend\
echo 5. Update public\firebase-messaging-sw.js with your Firebase config
echo.
echo To start the servers:
echo Backend:  cd backend ^&^& venv\Scripts\activate ^&^& python manage.py runserver
echo Frontend: npm run dev
echo.
echo 📖 See README.md for detailed instructions