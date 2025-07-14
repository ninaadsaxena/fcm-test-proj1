from django.db import models
from django.utils import timezone

class NotificationLog(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.title} - {self.timestamp}"