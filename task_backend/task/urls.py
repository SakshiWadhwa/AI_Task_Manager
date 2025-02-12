from django.urls import path

from .views import (create_category, create_task, delete_task, list_category, delete_category, get_due_soon_tasks,
                    list_tasks, retrieve_task, update_category, update_task, tasks_by_category, tasks_filter_based_on_category)

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
    path('categories/filter_task/', tasks_filter_based_on_category, name='filter-tasks-by-category'),

    path('due_soon/', get_due_soon_tasks, name='tasks-due-soon'),

]