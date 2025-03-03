from django.contrib import admin
from .models import StudentUser

@admin.register(StudentUser)
class StudentUserAdmin(admin.ModelAdmin):
    # list_display = ('user', 'grade')
    list_display = ('username', 'lastName', 'firstName', 'middleName', 'subject', 'grade', 'index', 'role')
    list_filter = ('username', 'lastName', 'firstName', 'middleName', 'subject', 'grade', 'index', 'role')
    search_fields = ('username', 'lastName', 'firstName', 'middleName', 'subject', 'grade', 'index', 'role')
