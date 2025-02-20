from django.contrib import admin
from .models import StudentUser

@admin.register(StudentUser)
class StudentUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'grade')
    list_filter = ('grade',)
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'grade')
