from django.contrib import admin
from .models import TeacherUser

@admin.register(TeacherUser)
class TeacherUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'specialization')
