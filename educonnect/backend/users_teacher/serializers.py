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
    middleName = serializers.CharField(source='middle_name')

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
                'middle_name': validated_data['middle_name'],
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
            'lastName': instance.user.last_name,
            'middleName': instance.middle_name
        }

class TeacherListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    firstName = serializers.CharField(source='user.first_name')
    lastName = serializers.CharField(source='user.last_name')
    middleName = serializers.CharField(source='user.middle_name')
    id = serializers.IntegerField(source='user.id')

    class Meta:
        model = TeacherUser
        fields = ['id', 'username', 'firstName', 'lastName', 'middleName']

class TeacherProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    # middle_name = serializers.CharField(required=False)
    middle_name = serializers.CharField(source='user.middle_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    subjects = serializers.SerializerMethodField()
    telegram = serializers.CharField(allow_blank=True, required=False)
    viber = serializers.CharField(allow_blank=True, required=False)
    about = serializers.CharField(allow_blank=True, required=False)
    specialization = serializers.CharField(allow_blank=True, required=False)
    school_name = serializers.CharField(required=False)
    contacts = serializers.JSONField(required=False)

    class Meta:
        model = TeacherUser
        fields = [
            'username', 'first_name', 'last_name', 'email',
            'telegram', 'viber', 'about', 'subjects', 'specialization',
            'middle_name', 'school_name', 'contacts'
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
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

        for attr, value in validated_data.items():
            # if attr != 'middle_name':  # Исключаем middle_name из обработки
                setattr(instance, attr, value)
        instance.save()

        return instance

    def to_representation(self, instance):
        # Возвращаем данные в том же формате, что и получаем
        return {
            'username': instance.user.username,
            'first_name': instance.user.first_name,
            'last_name': instance.user.last_name,
            'middle_name': instance.user.middle_name,
            'email': instance.user.email,
            'telegram': instance.telegram or '',
            'viber': instance.viber or '',
            'about': instance.about or '',
            'specialization': instance.specialization or '',
            'subjects': self.get_subjects(instance),
            'school_name': instance.school_name or '',
            'contacts': instance.contacts or {}
        }

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'grade', 'code'] 