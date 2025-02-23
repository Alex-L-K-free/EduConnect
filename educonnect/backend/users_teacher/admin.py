from django.contrib import admin
from .models import TeacherUser
from django.contrib.auth import get_user_model

User = get_user_model()

class TeacherUserAdmin(admin.ModelAdmin):
    list_display = ('get_username', 'get_first_name', 'get_last_name', 'get_email')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__email')
    fields = (
        'user',
        ('telegram', 'viber'),
        'about',
        'specialization'
    )

    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    get_username.admin_order_field = 'user__username'

    def get_first_name(self, obj):
        return obj.user.first_name
    get_first_name.short_description = 'First Name'
    get_first_name.admin_order_field = 'user__first_name'

    def get_last_name(self, obj):
        return obj.user.last_name
    get_last_name.short_description = 'Last Name'
    get_last_name.admin_order_field = 'user__last_name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'

    def save_model(self, request, obj, form, change):
        # Сохраняем связанного пользователя
        if obj.user:
            obj.user.save()
        super().save_model(request, obj, form, change)

admin.site.register(TeacherUser, TeacherUserAdmin)
