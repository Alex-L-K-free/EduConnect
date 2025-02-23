from rest_framework import serializers
from education_core.models import User
from .models import TeacherUser
from subjects.models import Subject, TeacherSubject
import logging

logger = logging.getLogger(__name__)

class TeacherRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')

    def create(self, validated_data):
        try:
            # Логируем данные
            logger.debug(f"Creating user with data: {validated_data}")
            
            # Создаем пользователя с email на основе username
            user_data = {
                'username': validated_data['username'],
                'password': validated_data['password'],
                'first_name': validated_data['first_name'],
                'last_name': validated_data['last_name'],
                'email': f"{validated_data['username']}@educonnect.local",  # Добавляем email
                'role': User.TEACHER
            }
            
            user = User.objects.create_user(**user_data)
            logger.debug(f"User created: {user}")
            
            # TeacherUser создастся автоматически через сигнал в User модели
            teacher = TeacherUser.objects.get(user=user)
            logger.debug(f"Teacher created: {teacher}")
            
            return teacher
        except Exception as e:
            logger.exception("Error in create method")
            raise serializers.ValidationError(str(e))

    def to_representation(self, instance):
        return {
            'id': instance.user.id,
            'username': instance.user.username,
            'firstName': instance.user.first_name,
            'lastName': instance.user.last_name
        }

class TeacherListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    firstName = serializers.CharField(source='user.first_name')
    lastName = serializers.CharField(source='user.last_name')
    id = serializers.IntegerField(source='user.id')

    class Meta:
        model = TeacherUser
        fields = ['id', 'username', 'firstName', 'lastName']

class TeacherProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    firstName = serializers.CharField(source='user.first_name')
    lastName = serializers.CharField(source='user.last_name')
    middleName = serializers.CharField(source='user.middle_name', allow_blank=True)
    email = serializers.EmailField(source='user.email')
    subjects = serializers.SerializerMethodField()
    telegram = serializers.CharField(allow_blank=True)
    viber = serializers.CharField(allow_blank=True)
    about = serializers.CharField(allow_blank=True)

    class Meta:
        model = TeacherUser
        fields = ['username', 'firstName', 'lastName', 'middleName', 'email', 
                 'telegram', 'viber', 'about', 'subjects', 'specialization']

    def get_subjects(self, obj):
        teacher_subjects = TeacherSubject.objects.filter(teacher=obj.user)
        return [
            {
                'id': ts.subject.id,
                'name': ts.subject.name,
                'grade': ts.subject.grade,
                'code': ts.subject.code
            } for ts in teacher_subjects
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Обновляем данные пользователя
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Обновляем данные учителя
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'grade', 'code'] 