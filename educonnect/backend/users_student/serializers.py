from rest_framework import serializers
from .models import StudentUser
from django.contrib.auth import authenticate

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