from django.contrib import admin
from .models import TeacherUser
from django.contrib.auth import get_user_model

User = get_user_model()

class TeacherUserAdmin(admin.ModelAdmin):
    list_display = ('get_username', 'get_first_name', 'get_last_name', 'get_email', 'telegram', 'viber', 'about', 'specialization')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__email', 'telegram', 'viber', 'about', 'specialization')
    
    fieldsets = (
        ('Основная информация', {
            'fields': (
                'user',
                ('get_first_name_display', 'get_last_name_display'),
                'get_email_display',
            )
        }),
        ('Контакты', {
            'fields': (
                'telegram',
                'viber',
            )
        }),
        ('Дополнительная информация', {
            'fields': (
                'about',
                'specialization',
            )
        }),
    )

    readonly_fields = ('get_first_name_display', 'get_last_name_display', 'get_email_display')

    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    get_username.admin_order_field = 'user__username'

    def get_first_name(self, obj):
        return obj.user.first_name
    get_first_name.short_description = 'Имя'
    get_first_name.admin_order_field = 'user__first_name'

    def get_last_name(self, obj):
        return obj.user.last_name
    get_last_name.short_description = 'Фамилия'
    get_last_name.admin_order_field = 'user__last_name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'

    def get_first_name_display(self, obj):
        return obj.user.first_name
    get_first_name_display.short_description = 'Имя'

    def get_last_name_display(self, obj):
        return obj.user.last_name
    get_last_name_display.short_description = 'Фамилия'

    def get_email_display(self, obj):
        return obj.user.email
    get_email_display.short_description = 'Email'

    def save_model(self, request, obj, form, change):
        if obj.user:
            obj.user.save()
        super().save_model(request, obj, form, change)

admin.site.register(TeacherUser, TeacherUserAdmin)
