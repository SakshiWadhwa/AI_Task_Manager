# backend/celery.py

from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# app.conf.broker_connection_retry_on_startup = True

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related config keys should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Define periodic task schedule
app.conf.beat_schedule = {
    'send-due-date-reminders': {
        'task': 'task.task_reminders.send_due_date_reminders',
        'schedule': crontab(minute="*"),  # Run hourly
    },
}
