from django.shortcuts import render
from django.utils import timezone
from datetime import timedelta
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.contrib.auth import get_user_model

from .models import Task, Category, TaskComment
from .serializers import CategorySerializer, TaskSerializer, TaskCommentSerializer


# Create your views here.

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_task(request):
    """
    Create a new task for the authenticated user.
    """
    serializer = TaskSerializer(data=request.data)
    print("res: ", request)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Ensure user is authenticated
def list_tasks(request):
    """
    Retrieve all tasks for the authenticated user.
    """
    print("User: ", request.user)  # Debugging
    tasks = Task.objects.filter(user=request.user)  # Get tasks assigned to user
    
    if not tasks.exists():
        return Response({"message": "No tasks found"}, status=status.HTTP_200_OK)

    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def retrieve_task(request, task_id):
    """
    Retrieve a specific task by ID.
    """
    try:
        task = Task.objects.get(id=task_id, user=request.user)
        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Task.DoesNotExist:
        return Response({"detail": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_task(request, task_id):
    """
    Update a task.
    """
    try:
        task = Task.objects.get(id=task_id, user=request.user)
    except Task.DoesNotExist:
        return Response({"detail": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = TaskSerializer(task, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_task(request, task_id):
    """
    Delete a task.
    """
    try:
        task = Task.objects.get(id=task_id, user=request.user)
        task.delete()
        return Response({"message": "Task deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except Task.DoesNotExist:
        return Response({"detail": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_category(request):
    """
    Create a new task for the authenticated user.
    """
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Ensure user is authenticated
def list_category(request):
    """
    Retrieve all categories for the authenticated user.
    """
    categories = Category.objects.all()
    if not categories.exists():
        return Response({"message": "No Category found"}, status=status.HTTP_200_OK)
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_category(request, category_id):
    """
    Update a category.
    """
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Response({"detail": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = CategorySerializer(category, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_category(request, category_id):
    """
    Delete a category.
    """
    try:
        category = Category.objects.get(id=category_id)
        category.delete()
        return Response({"message": "Category deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except Category.DoesNotExist:
        return Response({"detail": "Category not found"}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def tasks_by_category(request, category_id):
    """
    Retrieve all tasks that belong to a specific category.
    """
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

    tasks = Task.objects.filter(category=category, user=request.user)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def tasks_filter_based_on_category(request):
    """
    Retrieve all tasks that belong to a specific category.
    """
    category_id = request.query_params.get('category', None)

    if not category_id:
        return Response({"error": "Category ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

    tasks = Task.objects.filter(category=category, user=request.user)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_due_soon_tasks(request):
    """
    Get tasks that are due today or tomorrow.
    """
    # today = timezone.now().date()
    # tomorrow = today + timedelta(days=1)
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_end = today_start + timedelta(days=1, hours=23, minutes=59, seconds=59)

    
    # Filter tasks that are due today or tomorrow
    tasks_due_soon = Task.objects.filter(
        due_date__gte=today_start,
        due_date__lte=tomorrow_end
    ).order_by('due_date')

    serializer = TaskSerializer(tasks_due_soon, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def filter_tasks(request):
    """
    Retrieve tasks, optionally filtering by category and/or status.
    """
    # Start with the tasks for the authenticated user
    tasks = Task.objects.filter(user=request.user)

    # Filter by category if provided
    category_id = request.query_params.get('category_id', None)
    if category_id and category_id != "undefined":
        tasks = tasks.filter(category_id=category_id)

    # Filter by status if provided
    status_filter = request.query_params.get('status', None)
    if status_filter and status_filter != "undefined":
        if status_filter not in ['pending', 'in_progress', 'completed']:
            return Response(
                {"detail": "Invalid status filter. Choose from: pending, in_progress, completed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        tasks = tasks.filter(status=status_filter)

    # Filter by due_date if provided
    due_date_filter = request.query_params.get('due_date', None)
    if due_date_filter and due_date_filter != "undefined":
        try:
            due_date = timezone.datetime.strptime(due_date_filter, "%Y-%m-%d").date()
            tasks = tasks.filter(due_date=due_date)
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
    # Optionally, filter tasks that are due within the next 24 hours
    due_within_24h = request.query_params.get('due_within_24h', None)
    if due_within_24h and due_within_24h.lower() == 'true':
        now = timezone.now()
        tomorrow = now + timezone.timedelta(days=1)
        tasks = tasks.filter(due_date__gte=now.date(), due_date__lte=tomorrow.date())

    # Serialize the filtered task data
    serializer = TaskSerializer(tasks, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def assign_unassign_task(request, task_id):
    """
    Assign or unassign a task to a user.
    """
    print("taskid: ",task_id )
    try:
        task = Task.objects.get(id=task_id)  # Fetch the task
    except Task.DoesNotExist:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    # Check if the user is the task owner or an admin (permission check)
    if task.user != request.user and not request.user.is_staff:
        return Response({"detail": "You do not have permission to modify this task."},
                        status=status.HTTP_403_FORBIDDEN)

    # Get the user to assign or unassign from request data
    user_id = request.data.get("user_id", None)
    
    # Handle unassignment if no user_id is provided
    if user_id is None:
        task.assigned_to = None
        task.save()
        # Return task data after unassigning
        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)
    
    User = get_user_model()  # Get the actual user model
    try:
        assigned_user = User.objects.get(id=user_id)# Fetch the user to assign
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # If task is already assigned, you might want to handle the replacement logic (optional)
    task.assigned_to = assigned_user
    task.save()

    # Return task data after assignment
    return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_assigned_tasks(request):
    """
    Get the list of tasks assigned to the currently authenticated user.
    """
    # Get the tasks assigned to the logged-in user
    tasks = Task.objects.filter(assigned_to=request.user)

    # Serialize the tasks
    serializer = TaskSerializer(tasks, many=True)

    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def task_comments(request, task_id):
    """
    Retrieve all comments for a task or add a new comment.
    """
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Get all comments for the task
        comments = TaskComment.objects.filter(task=task).order_by("-timestamp")
        serializer = TaskCommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Create a new comment
        serializer = TaskCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_comment(request, comment_id):
    """
    API to delete a comment.
    Only the comment owner can delete it.
    """
    try:
        comment = TaskComment.objects.get(id=comment_id)
    except TaskComment.DoesNotExist:
        return Response({"detail": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

    if comment.user != request.user:
        return Response({"detail": "You do not have permission to delete this comment."}, 
                        status=status.HTTP_403_FORBIDDEN)

    comment.delete()
    return Response({"detail": "Comment deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
