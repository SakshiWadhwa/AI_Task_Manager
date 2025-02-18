from django.core.mail import send_mail
from django.conf import settings
from rest_framework.test import APITestCase
from unittest.mock import patch
from rest_framework import status
from django.utils import timezone
from django.utils.timezone import make_aware
from datetime import timedelta
from task.models import Category, Task
from .task_reminders import send_due_date_reminders
from django.conf import settings


class TaskCategoryAPITestCase(APITestCase):
    
    def setUp(self):
        """Set up test data for each test"""
        self.user = settings.AUTH_USER_MODEL.objects.create_user(email="testuser@gmail.com", password="password123")
        self.client.force_authenticate(user=self.user)  # Authenticate user
        self.category = Category.objects.create(name="Work")
        self.task = Task.objects.create(
            user=self.user,
            title="Finish API",
            description="Complete the API development",
            category=self.category,
        )

    def test_create_category(self):
        """Test creating a new category"""
        data = {"name": "Health"}
        response = self.client.post("/task/categories/create/", data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Health")

    def test_retrieve_categories(self):
        """Test retrieving all categories"""
        response = self.client.get("/task/categories/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        self.assertEqual(response.data[0]["name"], "Work")

    def test_update_category(self):
        """Test updating an existing category"""
        data = {"name": "Updated Work"}
        response = self.client.put(f"/task/categories/{self.category.id}/update/", data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.category.refresh_from_db()  # Refresh category from DB
        self.assertEqual(self.category.name, "Updated Work")

    def test_delete_category(self):
        """Test deleting a category"""
        response = self.client.delete(f"/task/categories/{self.category.id}/delete/")
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(id=self.category.id).exists())  # Ensure category is deleted

    def test_create_task_with_category(self):
        """Test creating a task with a category"""
        data = {
            "title": "New Task",
            "description": "Test Task",
            "category_id":self.category.id
        }
        response = self.client.post("/task/create/", data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["category"]["name"], "Work")

    def test_filter_tasks_by_category(self):
        """Test filtering tasks by category"""
        response = self.client.get(f"/task/filter_task/?category_id={self.category.id}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        self.assertEqual(response.data[0]["category"]["name"], "Work")
    
    def test_filter_tasks_by_status(self):
        """Test filtering tasks by status"""
        response_status = self.client.get(f"/task/filter_task/?status=pending")
        
        # Verify status filtering works
        self.assertEqual(response_status.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response_status.data), 0)
        self.assertEqual(response_status.data[0]["status"], "pending")

    def test_filter_tasks_by_category_and_status(self):
        """Test filtering tasks by both category and status"""
        response_both = self.client.get(f"/task/filter_task/?category_id={self.category.id}&status=pending")
        
        # Verify both filters work together
        self.assertEqual(response_both.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response_both.data), 0)
        self.assertEqual(response_both.data[0]["category"]["id"], self.category.id)
        self.assertEqual(response_both.data[0]["status"], "pending")
    
    def test_filter_tasks_by_due_date(self):
        """Test filtering tasks by due date"""
        due_date = timezone.now().date()  # Use today's date
        # Create a task with today's due date
        task_today = Task.objects.create(
            title="Task Due Today",
            description="This task is due today.",
            category=self.category,
            user=self.user,
            due_date=due_date,
            status="pending"
        )

        # Query the endpoint with the due_date filter
        response = self.client.get(f"/task/filter_task/?due_date={due_date}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        
        # Check that the returned task matches the expected due_date format (ISO 8601 format)
        returned_due_date = response.data[0]['due_date']
        
        # Ensure the returned due date matches the ISO format: 'YYYY-MM-DDT00:00:00Z'
        expected_due_date = due_date.strftime('%Y-%m-%d') + 'T00:00:00Z'
        self.assertEqual(returned_due_date, expected_due_date)

    def test_filter_tasks_by_invalid_due_date_format(self):
        """Test filtering tasks by an invalid due date format"""
        response = self.client.get(f"/task/filter_task/?due_date=2025-13-01")  # Invalid month
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], "Invalid date format. Use YYYY-MM-DD.")

    def test_filter_tasks_due_within_24h(self):
        """Test filtering tasks that are due within the next 24 hours"""
        now = timezone.now()
        tomorrow_start = now + timedelta(days=1)
        
        # Create a task due within the next 24 hours
        task = Task.objects.create(
            title="Task Due Soon",
            description="Task that will be due within 24 hours",
            category=self.category,
            user=self.user,
            due_date=now,
            status="pending",
        )
        
        response = self.client.get(f"/task/filter_task/?due_within_24h=true")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        self.assertEqual(response.data[0]['id'], task.id)

    def test_get_due_soon_tasks(self):
        """Test retrieving tasks due soon (today/tomorrow)."""
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow_start = today_start + timedelta(days=1)
        tomorrow_end = tomorrow_start + timedelta(hours=23, minutes=59, seconds=59)

        # Create tasks with different due dates
        task_today = Task.objects.create(
            title='Task Due Today',
            description='This task is due today.',
            status='pending',
            due_date=now,  # Current time today
            user=self.user,
            category=self.category,
        )
        
        task_tomorrow = Task.objects.create(
            title='Task Due Tomorrow',
            description='This task is due tomorrow.',
            status='pending',
            due_date=tomorrow_start,  # Start of tomorrow
            user=self.user,
            category=self.category,
        )
        
        task_later = Task.objects.create(
            title='Task Due Later',
            description='This task is due later.',
            status='pending',
            due_date=tomorrow_end + timedelta(seconds=1),  # One second past tomorrow
            user=self.user,
            category=self.category,
        )
        
        # Filter tasks due soon (today or tomorrow)
        response = self.client.get('/task/due_soon/')

        # Assert response status and data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Only today and tomorrow's tasks should be returned
        self.assertIn(task_today.id, [task['id'] for task in response.data])
        self.assertIn(task_tomorrow.id, [task['id'] for task in response.data])
        self.assertNotIn(task_later.id, [task['id'] for task in response.data])
    
    @patch('task.task_reminders.send_mail')
    @patch('django.utils.timezone.now')
    def test_send_due_soon_email_reminder(self, mock_now, mock_send_mail):
        """Test sending email reminders for tasks with due dates within 24 hours."""
        mock_now.return_value = timezone.make_aware(timezone.datetime(2025, 2, 12, 18, 50, 32))
        
        # Create a test user
        test_user = settings.AUTH_USER_MODEL.objects.create_user( 
            email='sakshiwadhwabuffer@gmail.com', 
            password='password'
        )
        
        # Create a task due within 1 hour (to match your filter in the task)
        due_date = timezone.now() + timedelta(hours=1)
        task = Task.objects.create(
            title='Test Task Due Soon',
            description='This task is due within 1 hour.',
            status='pending',
            due_date=due_date,
            user=test_user
        )
        
        # Manually trigger the Celery task
        send_due_date_reminders()

        # Assert that send_mail was called with the expected arguments
        mock_send_mail.assert_called_with(
            subject = "Reminder: Task 'Test Task Due Soon' is due soon",
            message = f"Your task 'Test Task Due Soon' is due on {due_date}. Please complete it on time.",
            from_email = settings.DEFAULT_FROM_EMAIL,
            recipient_list = [test_user.email],
        )

    def test_assign_task_to_user(self):
        """Test assigning a task to another user"""
        response = self.client.patch(f"/task/{self.task.id}/assign/", {"user_id": self.user.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.assigned_to, self.user)
    
    def test_unassign_task(self):
        """Test unassigning a task (removing assigned user)"""
        self.task.assigned_to = self.user
        self.task.save()
        response = self.client.patch(f"/task/{self.task.id}/assign/", {})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertIsNone(self.task.assigned_to)
    
