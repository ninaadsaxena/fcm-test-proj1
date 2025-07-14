import json
import os
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from firebase_admin import credentials, messaging, initialize_app
from django.conf import settings
from .models import NotificationLog
from .serializers import NotificationLogSerializer, SendNotificationSerializer

# Initialize Firebase Admin SDK
try:
    if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        initialize_app(cred)
        print("Firebase Admin SDK initialized successfully")
    else:
        print(f"Firebase credentials file not found at: {settings.FIREBASE_CREDENTIALS_PATH}")
except Exception as e:
    print(f"Firebase initialization error: {e}")

@api_view(['POST'])
def send_notification(request):
    """Send FCM notification and log it"""
    serializer = SendNotificationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    title = data['title']
    body = data['body']
    fcm_token = data.get('fcm_token')
    topic = data.get('topic')
    
    try:
        # Create notification message
        message_data = messaging.Notification(
            title=title,
            body=body
        )
        
        # Determine target (token or topic)
        if fcm_token:
            message = messaging.Message(
                notification=message_data,
                token=fcm_token,
                webpush=messaging.WebpushConfig(
                    notification=messaging.WebpushNotification(
                        title=title,
                        body=body,
                        icon='/icon-192x192.png',
                        badge='/badge-72x72.png'
                    )
                )
            )
        elif topic:
            message = messaging.Message(
                notification=message_data,
                topic=topic,
                webpush=messaging.WebpushConfig(
                    notification=messaging.WebpushNotification(
                        title=title,
                        body=body,
                        icon='/icon-192x192.png',
                        badge='/badge-72x72.png'
                    )
                )
            )
        else:
            # Default to topic 'all' if no token or topic provided
            message = messaging.Message(
                notification=message_data,
                topic='all',
                webpush=messaging.WebpushConfig(
                    notification=messaging.WebpushNotification(
                        title=title,
                        body=body,
                        icon='/icon-192x192.png',
                        badge='/badge-72x72.png'
                    )
                )
            )
        
        # Send the message
        response = messaging.send(message)
        print(f"Successfully sent message: {response}")
        
        # Log the notification
        NotificationLog.objects.create(title=title, body=body)
        
        return Response({'success': True, 'message_id': response})
        
    except Exception as e:
        print(f"Error sending notification: {e}")
        return Response(
            {'success': False, 'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_notifications(request):
    """Get last 10 notifications"""
    notifications = NotificationLog.objects.all()[:10]
    serializer = NotificationLogSerializer(notifications, many=True)
    return Response(serializer.data)