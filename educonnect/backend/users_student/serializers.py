from rest_framework import serializers
from .models import StudentUser
from education_core.models import User

class StudentSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentUser
        fields = ['id', 'username', 'firstName', 'lastName', 'middleName', 
                 'grade', 'index', 'subject', 'role']

    def get_username(self, obj):
        if obj.user:
            return obj.user.username
        return 'Не зарегистрирован'

    def create(self, validated_data):
        student = StudentUser.objects.create(**validated_data)
        return student

    def update(self, instance, validated_data):
        # Явно обновляем каждое поле
        instance.firstName = validated_data.get('firstName', instance.firstName)
        instance.lastName = validated_data.get('lastName', instance.lastName)
        instance.middleName = validated_data.get('middleName', instance.middleName)
        instance.grade = validated_data.get('grade', instance.grade)
        instance.subject = validated_data.get('subject', instance.subject)
        instance.index = validated_data.get('index', instance.index)
        instance.save()
        return instance

    def to_representation(self, instance):
        # Формируем отображение данных
        representation = super().to_representation(instance)
        if instance.user:
            # Если ученик уже зарегистрирован, показываем его username
            representation['username'] = instance.user.username
        else:
            representation['username'] = 'Не зарегистрирован'
        return representation 