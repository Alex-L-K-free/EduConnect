from rest_framework import serializers
from education_core.models import User
from .models import TeacherUser

class TeacherRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')

    def create(self, validated_data):
        # Создаем пользователя
        user_data = {
            'username': validated_data['username'],
            'password': validated_data['password'],
            'first_name': validated_data['first_name'],
            'last_name': validated_data['last_name'],
            'role': User.TEACHER
        }
        
        user = User.objects.create_user(**user_data)
        
        # TeacherUser создастся автоматически через сигнал в User модели
        return TeacherUser.objects.get(user=user)

    def to_representation(self, instance):
        return {
            'id': instance.user.id,
            'username': instance.user.username,
            'firstName': instance.user.first_name,
            'lastName': instance.user.last_name
        } 