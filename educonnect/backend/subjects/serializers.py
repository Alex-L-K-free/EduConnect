from rest_framework import serializers
from .models import Subject, TeacherSubject, SubjectEnrollment

class SubjectSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ['id', 'name', 'grade', 'code', 'teacher_name', 'is_enrolled']

    def get_teacher_name(self, obj):
        teacher = obj.teachers.first()
        if teacher:
            return f"{teacher.teacher.first_name} {teacher.teacher.last_name}"
        return None

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SubjectEnrollment.objects.filter(
                student=request.user,
                subject=obj
            ).exists()
        return False

class TeacherSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherSubject
        fields = ['id', 'subject', 'teacher', 'assigned_at']

class SubjectEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectEnrollment
        fields = ['id', 'subject', 'student', 'enrolled_at'] 