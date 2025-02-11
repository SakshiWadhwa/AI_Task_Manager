from django.urls import path
from .views import create_task, list_tasks, retrieve_task, update_task, delete_task

urlpatterns = [
    path('', list_tasks, name='list-tasks'),  # GET: List all tasks
    path('create/', create_task, name='create-task'),  # POST: Create a task
    path('<int:task_id>/', retrieve_task, name='retrieve-task'),  # GET: Get a single task
    path('<int:task_id>/update/', update_task, name='update-task'),  # PUT/PATCH: Update a task
    path('<int:task_id>/delete/', delete_task, name='delete-task'),  # DELETE: Delete a task
]