from rest_framework import serializers
from .models import StudentUser

class StudentSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = StudentUser
        fields = ['id', 'username', 'firstName', 'lastName', 'middleName', 
                 'subject', 'grade', 'index', 'role', 'teacher']

    def get_username(self, obj):
        return obj.username if obj.username else 'Не зарегистрирован'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation 