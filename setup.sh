#!/bin/bash

echo "🚀 Setting up FCM Test Project..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo "📦 Setting up Django backend..."
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment (Linux/Mac)
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

echo "✅ Backend setup complete"

# Setup Frontend
echo "📦 Setting up React frontend..."
cd ..

# Install Node.js dependencies
npm install

echo "✅ Frontend setup complete"

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Create a Firebase project and get your configuration"
echo "2. Copy .env.example to .env and fill in your Firebase config"
echo "3. Copy backend/.env.example to backend/.env and add your Firebase service account path"
echo "4. Download your Firebase service account JSON file to backend/"
echo "5. Update public/firebase-messaging-sw.js with your Firebase config"
echo ""
echo "To start the servers:"
echo "Backend:  cd backend && source venv/bin/activate && python manage.py runserver"
echo "Frontend: npm run dev"
echo ""
echo "📖 See README.md for detailed instructions"