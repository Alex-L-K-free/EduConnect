from rest_framework import serializers
from .models import StudentUser
from education_core.models import User

class StudentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    firstName = serializers.CharField(source='user.first_name')
    lastName = serializers.CharField(source='user.last_name')
    middleName = serializers.CharField(source='user.middle_name', required=False, allow_blank=True)
    
    class Meta:
        model = StudentUser
        fields = ['id', 'username', 'firstName', 'lastName', 'middleName', 'grade', 'subject', 'index']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(
            username=user_data['username'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            middle_name=user_data.get('middle_name', ''),
            role=User.STUDENT
        )
        student = StudentUser.objects.create(user=user, **validated_data)
        return student

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance 