from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from education_core.models import User
from .models import AdminUser

class AdminUserInline(admin.StackedInline):
    model = AdminUser
    can_delete = False

class CustomUserAdmin(UserAdmin):
    inlines = (AdminUserInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'middle_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {'fields': ('role', 'phone', 'avatar')}),
    )

@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'admin_type', 'is_super_admin')
    list_filter = ('admin_type', 'is_super_admin')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'user__middle_name')
    
    def get_queryset(self, request):
        # Показываем только администраторов
        return super().get_queryset(request).filter(user__role=User.ADMIN)

# Регистрируем модель User с нашим CustomUserAdmin
admin.site.register(User, CustomUserAdmin)
