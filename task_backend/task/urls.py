from django.urls import path

from .views import (create_category, create_task, delete_task, list_category, delete_category, get_due_soon_tasks,
                    list_tasks, retrieve_task, update_category, update_task, tasks_by_category, filter_tasks,
                    get_assigned_tasks, assign_unassign_task, task_comments
                    )

urlpatterns = [
    path('', list_tasks, name='list-tasks'),  # GET: List all tasks
    path('create/', create_task, name='create-task'),  # POST: Create a task
    path('<int:task_id>/', retrieve_task, name='retrieve-task'),  # GET: Get a single task
    path('<int:task_id>/update/', update_task, name='update-task'),  # PUT/PATCH: Update a task
    path('<int:task_id>/delete/', delete_task, name='delete-task'),  # DELETE: Delete a task

    path('categories/', list_category, name='list-tasks'),  # GET: List all categories
    path('categories/create/', create_category, name='create-category'),  # POST: Create a category
    path('categories/<int:category_id>/update/', update_category, name='update-category'),  # PUT/PATCH: Update a category
    path('categories/<int:category_id>/delete/', delete_category, name='delete-category'),  # DELETE: Delete a category

    path('categories/task_by_category/<int:category_id>/', tasks_by_category, name='tasks-by-category'),
    path('filter_task/', filter_tasks, name='filter-task'),

    path('due_soon/', get_due_soon_tasks, name='tasks-due-soon'),
    path('<int:task_id>/assign_unassign_task/', assign_unassign_task, name='assign-unassign-task'),
    path('assigned_task_list/', get_assigned_tasks, name='get-assigned-tasks'),

    path("<int:task_id>/comments/", task_comments, name="task-comments"),

]