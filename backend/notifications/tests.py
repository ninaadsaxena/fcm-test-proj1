from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import NotificationLog


class NotificationLogModelTest(TestCase):
    def test_notification_log_creation(self):
        """Test creating a notification log entry"""
        notification = NotificationLog.objects.create(
            title="Test Notification",
            body="This is a test notification"
        )
        self.assertEqual(notification.title, "Test Notification")
        self.assertEqual(notification.body, "This is a test notification")
        self.assertIsNotNone(notification.timestamp)


class NotificationAPITest(APITestCase):
    def test_get_notifications(self):
        """Test getting notifications list"""
        # Create test notification
        NotificationLog.objects.create(
            title="Test Notification",
            body="Test body"
        )
        
        url = reverse('get_notifications')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Test Notification")