from rest_framework import serializers
from .models import Material, StudentMaterial

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

class StudentMaterialSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None

    class Meta:
        model = StudentMaterial
        fields = ['id', 'title', 'description', 'file', 'file_url', 'material_type', 'created_at', 'is_viewed']