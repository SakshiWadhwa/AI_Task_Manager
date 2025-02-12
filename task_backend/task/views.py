from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

from .models import Task, Category
from .serializers import CategorySerializer, TaskSerializer


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
