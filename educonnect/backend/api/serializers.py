from rest_framework import serializers
from education_core.models import User
from users_student.models import StudentUser
from users_teacher.models import TeacherUser

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
            'about'
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
        # Получаем предметы из связи с учителем
        if not obj.teacher or not obj.teacher.teacher_profile:
            return []
            
        teacher_subjects = obj.teacher.teacher_profile.specialization.split(',') if obj.teacher.teacher_profile.specialization else []
        
        return [
            {
                'name': subject.strip(),
                'average_grade': None,  # Можно добавить расчет среднего балла
                'teacher_name': f"{obj.teacher.first_name} {obj.teacher.last_name}" if obj.teacher else None,
                'schedule': [],  # Можно добавить расписание
                'next_lesson': None  # Можно добавить следующий урок
            }
            for subject in teacher_subjects
        ]

    def get_classmates(self, obj):
        # Получаем список одноклассников (студентов того же класса)
        classmates = StudentUser.objects.filter(
            grade=obj.grade,
            index=obj.index
        ).exclude(id=obj.id)
        
        return [
            {
                'firstName': classmate.firstName,
                'lastName': classmate.lastName
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