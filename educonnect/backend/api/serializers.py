from rest_framework import serializers
from education_core.models import User
from users_student.models import StudentUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'middle_name','role')

class StudentProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='firstName')
    last_name = serializers.CharField(source='lastName')
    middle_name = serializers.CharField(source='middleName')
    about = serializers.CharField(allow_blank=True, required=False)
    contacts = serializers.JSONField(required=False)
    
    class Meta:
        model = StudentUser
        fields = ('username', 'first_name', 'last_name', 'middle_name', 'grade', 'about', 'contacts')
        read_only_fields = ('username', 'grade')