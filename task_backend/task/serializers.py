from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'user', 'title', 'description', 'status', 'created_at', 'updated_at']
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
