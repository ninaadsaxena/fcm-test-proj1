from django.contrib import admin
from .models import NotificationLog

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ['title', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['title', 'body']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']