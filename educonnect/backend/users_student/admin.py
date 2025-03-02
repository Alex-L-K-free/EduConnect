from django.contrib import admin
from .models import StudentUser

@admin.register(StudentUser)
class StudentUserAdmin(admin.ModelAdmin):
    # list_display = ('user', 'grade')
    list_display = ('user__username', 'lastName', 'firstName', 'middleName', 'subject', 'grade', 'index', 'role')
    list_filter = ('user__username', 'lastName', 'firstName', 'middleName', 'subject', 'grade', 'index', 'role')
    search_fields = ('user__username', 'lastName', 'firstName', 'middleName', 'subject', 'grade', 'index', 'role')
