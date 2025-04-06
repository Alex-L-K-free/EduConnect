from rest_framework import serializers
from .models import StudentUser
from django.contrib.auth import authenticate
from subjects.models import Subject, SubjectEnrollment
import logging

logger = logging.getLogger(__name__)

class StudentSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = StudentUser
        fields = ['id', 'username', 'firstName', 'lastName', 'middleName', 
                 'subject', 'grade', 'index', 'role', 'teacher']
        extra_kwargs = {
            'username': {'required': True, 'allow_blank': False},
            'password': {'required': True, 'write_only': True},
            'lastName': {'required': True, 'allow_blank': False},
            'firstName': {'required': True, 'allow_blank': False},
        }

    def get_username(self, obj):
        return obj.username if obj.username else 'Не зарегистрирован'

    def create(self, validated_data):
        logger.debug(f"Creating new student with data: {validated_data}")
        # Получаем предмет из данных
        subject_name = validated_data.get('subject')
        logger.debug(f"Subject name from data: {subject_name}")

        # Создаем студента
        student = super().create(validated_data)
        logger.debug(f"Created student: {student}")

        # Если указан предмет, создаем запись в SubjectEnrollment
        if subject_name:
            try:
                # Получаем или создаем предмет
                subject, created = Subject.objects.get_or_create(
                    name=subject_name,
                    defaults={'grade': validated_data.get('grade', ''), 'index': validated_data.get('index', '')}
                )
                logger.debug(f"Found or created subject: {subject} (created: {created})")

                # Создаем запись в SubjectEnrollment
                enrollment = SubjectEnrollment.objects.create(
                    student=student,
                    subject=subject
                )
                logger.debug(f"Created enrollment: {enrollment}")
            except Exception as e:
                logger.error(f"Error creating subject enrollment: {str(e)}")

        return student

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation 

class StudentLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                return {
                    'id': user.id,
                    'username': user.username,
                    'role': 'student',  # Укажите роль, если необходимо
                }
            else:
                raise serializers.ValidationError("Неверные учетные данные")
        else:
            raise serializers.ValidationError("Необходимо ввести логин и пароль") 