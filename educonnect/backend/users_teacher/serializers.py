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
    email = serializers.EmailField(source='user.email', required=False)
    subjects = serializers.SerializerMethodField()
    telegram = serializers.CharField(allow_blank=True, required=False)
    viber = serializers.CharField(allow_blank=True, required=False)
    about = serializers.CharField(allow_blank=True, required=False)
    specialization = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = TeacherUser
        fields = [
            'username', 'firstName', 'lastName', 'email',
            'telegram', 'viber', 'about', 'subjects', 'specialization'
        ]

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
        logger.debug(f"Starting update with validated data: {validated_data}")
        
        # Получаем данные пользователя
        user = instance.user
        
        # Обновляем поля пользователя из validated_data
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            logger.debug(f"Updating user with data: {user_data}")
            
            # Обновляем first_name и last_name
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            if 'email' in user_data:
                user.email = user_data['email']
                
            user.save()
            logger.debug(f"Updated user fields: {user.first_name}, {user.last_name}, {user.email}")

        # Обновляем поля учителя
        if 'telegram' in validated_data:
            instance.telegram = validated_data['telegram']
        if 'viber' in validated_data:
            instance.viber = validated_data['viber']
        if 'about' in validated_data:
            instance.about = validated_data['about']
        if 'specialization' in validated_data:
            instance.specialization = validated_data['specialization']
            
        instance.save()
        logger.debug(f"Updated teacher fields: {instance.telegram}, {instance.viber}, {instance.about}, {instance.specialization}")

        # Обновляем instance из базы данных
        instance.refresh_from_db()
        user.refresh_from_db()
        
        return instance

    def to_representation(self, instance):
        data = {
            'username': instance.user.username,
            'firstName': instance.user.first_name,
            'lastName': instance.user.last_name,
            'email': instance.user.email,
            'telegram': instance.telegram or '',
            'viber': instance.viber or '',
            'about': instance.about or '',
            'specialization': instance.specialization or '',
            'subjects': self.get_subjects(instance)
        }
        logger.debug(f"Returning serialized data: {data}")
        return data

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'grade', 'code'] 