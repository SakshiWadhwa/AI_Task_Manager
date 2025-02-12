from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from task.models import Category, Task


class TaskCategoryAPITestCase(APITestCase):
    
    def setUp(self):
        """Set up test data for each test"""
        self.user = User.objects.create_user(username="testuser", password="password123")
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
        print("res1: ", response.data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["category"]["name"], "Work")

    def test_filter_tasks_by_category(self):
        """Test filtering tasks by category"""
        response = self.client.get(f"/task/categories/task_by_category/{self.category.id}/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        self.assertEqual(response.data[0]["category"]["name"], "Work")
