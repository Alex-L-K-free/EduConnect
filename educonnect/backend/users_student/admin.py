from django.contrib import admin
from .models import StudentUser

@admin.register(StudentUser)
class StudentUserAdmin(admin.ModelAdmin):
    # list_display = ('user', 'grade')
    list_display = ('username', 'lastName', 'firstName', 'middleName', 'subject', 'grade', 'index', 'teacher')
    list_filter = ('teacher', 'grade', 'subject')
    search_fields = ('username', 'lastName', 'firstName', 'middleName', 'subject', 'grade', 'index', 'role')
