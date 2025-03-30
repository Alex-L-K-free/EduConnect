from rest_framework import serializers
from education_core.models import User
from users_student.models import StudentUser
from users_teacher.models import TeacherUser
from materials.models import Material
from materials.models import StudentMaterial
from materials.serializers import StudentMaterialSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'middle_name','role')

class TeacherSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    middle_name = serializers.CharField(source='user.middle_name')
    
    class Meta:
        model = TeacherUser
        fields = (
            'first_name',
            'last_name',
            'middle_name',
            'specialization',
            'contacts',
            'about',
            'school_name',
            'telegram',
            'viber'
        )

class StudentProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='firstName', required=False)
    last_name = serializers.CharField(source='lastName', required=False)
    middle_name = serializers.CharField(source='middleName', required=False)
    about = serializers.CharField(allow_blank=True, required=False)
    contacts = serializers.JSONField(required=False, default=dict)
    teacher = TeacherSerializer(source='teacher.teacher_profile', read_only=True)
    subjects_details = serializers.SerializerMethodField()
    classmates = serializers.SerializerMethodField()

    class Meta:
        model = StudentUser
        fields = (
            'username',
            'first_name',
            'last_name',
            'middle_name',
            'about',
            'contacts',
            'grade',
            'index',
            'teacher',
            'subjects_details',
            'classmates'
        )
        read_only_fields = ('username',)

    def get_subjects_details(self, obj):
        if not obj.subject:
            return []
            
        student_subjects = [s.strip() for s in obj.subject.split(',') if s.strip()]
        
        subjects_with_materials = []
        for subject in student_subjects:
            # Получаем материалы для текущего студента по предмету
            materials = StudentMaterial.objects.filter(
                student=obj,
                material_type__in=['document', 'video', 'presentation']  # Исключаем другие типы материалов
            ).order_by('-created_at')
            
            # Используем существующий сериализатор для материалов
            materials_serializer = StudentMaterialSerializer(
                materials, 
                many=True,
                context=self.context
            )
            
            subjects_with_materials.append({
                'name': subject,
                'materials': materials_serializer.data
            })
        
        return subjects_with_materials

    def get_classmates(self, obj):
        # Получаем список одноклассников (студентов того же класса)
        classmates = StudentUser.objects.filter(
            grade=obj.grade,
            index=obj.index
        ).exclude(id=obj.id)
        
        return [
            {
                'firstName': classmate.firstName,
                'lastName': classmate.lastName,
                'isRegistered': bool(classmate.auth_token)  # Проверяем наличие токена для определения регистрации
            }
            for classmate in classmates
        ]

    def update(self, instance, validated_data):
        # Обработка вложенных полей
        instance.firstName = validated_data.get('firstName', instance.firstName)
        instance.lastName = validated_data.get('lastName', instance.lastName)
        instance.middleName = validated_data.get('middleName', instance.middleName)
        instance.about = validated_data.get('about', instance.about)
        instance.contacts = validated_data.get('contacts', instance.contacts)
        instance.save()
        return instance