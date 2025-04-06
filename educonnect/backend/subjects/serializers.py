from rest_framework import serializers
from .models import Subject, TeacherSubject, SubjectEnrollment
from users_student.models import StudentUser

class SubjectSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField(read_only=True)
    is_enrolled = serializers.SerializerMethodField(read_only=True)
    code = serializers.CharField(read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'grade', 'index', 'code', 'teacher_name', 'is_enrolled']

    def get_teacher_name(self, obj):
        teacher = obj.teachers.first()
        if teacher:
            return f"{teacher.teacher.first_name} {teacher.teacher.last_name}"
        return None

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                student = StudentUser.objects.get(username=request.user.username)
                return SubjectEnrollment.objects.filter(
                    student=student,
                    subject=obj
                ).exists()
            except StudentUser.DoesNotExist:
                return False
        return False

class TeacherSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherSubject
        fields = ['id', 'subject', 'teacher', 'assigned_at']

class SubjectEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectEnrollment
        fields = ['id', 'subject', 'student', 'enrolled_at'] 