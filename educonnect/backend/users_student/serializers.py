from rest_framework import serializers
from .models import StudentUser
from education_core.models import User

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentUser
        fields = ['id', 'firstName', 'lastName', 'middleName', 'grade', 'subject', 'index']

    def create(self, validated_data):
        student = StudentUser.objects.create(**validated_data)
        return student

    def update(self, instance, validated_data):
        # Обновляем только данные ученика
        instance.grade = validated_data.get('grade', instance.grade)
        instance.index = validated_data.get('index', instance.index)
        instance.subject = validated_data.get('subject', instance.subject)
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