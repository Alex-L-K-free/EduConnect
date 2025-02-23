from django.contrib import admin
from .models import TeacherUser
from django.contrib.auth import get_user_model

User = get_user_model()

class TeacherUserAdmin(admin.ModelAdmin):
    list_display = ('get_username', 'get_full_name', 'get_email', 'specialization')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'specialization')
    list_filter = ('specialization',)
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    
    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = 'Full Name'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

    def save_model(self, request, obj, form, change):
        # Сохраняем связанного пользователя
        if obj.user:
            obj.user.save()
        super().save_model(request, obj, form, change)

admin.site.register(TeacherUser, TeacherUserAdmin)
