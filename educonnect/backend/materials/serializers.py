from rest_framework import serializers
from .models import Material, StudentMaterial

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

class StudentMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentMaterial
        fields = ['id', 'title', 'description', 'file', 'created_at', 'is_viewed']
        read_only_fields = ['created_at', 'is_viewed']