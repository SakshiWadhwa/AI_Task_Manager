from rest_framework import serializers
from .models import Task, Category

class CategorySerializer(serializers.ModelSerializer):
    # convert Category model instances into JSON format
    class Meta:
        model = Category
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)  # Show category details
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )

    class Meta:
        model = Task
        fields = ['id', 'user', 'title', 'description', 'status', 'due_date', 'assigned_to', 'created_at', 'updated_at', 'category', 'category_id']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']  # These fields shouldn't be modified by the user

    def validate_title(self, value):
        """Ensure title is not empty and has at least 3 characters."""
        if len(value) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long.")
        return value

    def validate_status(self, value):
        """Ensure status is valid."""
        valid_statuses = ['pending', 'in_progress', 'completed']
        if value not in valid_statuses:
            raise serializers.ValidationError("Invalid status. Choose from: pending, in_progress, completed.")
        return value
