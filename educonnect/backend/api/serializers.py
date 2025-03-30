from rest_framework import serializers
from education_core.models import User
from users_student.models import StudentUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'middle_name','role')

class StudentProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='firstName', required=False)
    last_name = serializers.CharField(source='lastName', required=False)
    middle_name = serializers.CharField(source='middleName', required=False)
    about = serializers.CharField(allow_blank=True, required=False)
    contacts = serializers.JSONField(required=False, default=dict)

    def update(self, instance, validated_data):
        # Обработка вложенных полей
        instance.firstName = validated_data.get('firstName', instance.firstName)
        instance.lastName = validated_data.get('lastName', instance.lastName)
        instance.middleName = validated_data.get('middleName', instance.middleName)
        instance.about = validated_data.get('about', instance.about)
        instance.contacts = validated_data.get('contacts', instance.contacts)
        instance.save()
        return instance
    
    class Meta:
        model = StudentUser
        fields = ('username', 'first_name', 'last_name', 'middle_name', 'about', 'contacts')
        read_only_fields = ('username',)