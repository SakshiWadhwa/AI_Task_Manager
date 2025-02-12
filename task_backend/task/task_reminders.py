# tasks/tasks.py

from celery import shared_task
from django.utils import timezone
from .models import Task
from django.core.mail import send_mail
from django.conf import settings
import logging

@shared_task
def send_due_date_reminders():
    """Send reminder emails for tasks that are due soon."""
    now = timezone.now()
    upcoming_tasks = Task.objects.filter(due_date__lte=now + timezone.timedelta(hours=1), status='pending')
    logging.info(f"Found {len(upcoming_tasks)} upcoming tasks for reminders.")
    for task in upcoming_tasks:
        # Send reminder email
        send_mail(
            subject=f"Reminder: Task '{task.title}' is due soon",
            message=f"Your task '{task.title}' is due on {task.due_date}. Please complete it on time.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[task.user.email],
        )
