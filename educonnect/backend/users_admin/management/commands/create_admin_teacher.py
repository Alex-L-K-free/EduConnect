# python manage.py create_admin_teacher
from django.core.management.base import BaseCommand
from education_core.models import User
from users_admin.models import AdminUser

class Command(BaseCommand):
    help = 'Creates an admin-teacher user'

    def handle(self, *args, **kwargs):
        try:
            # Проверяем, существует ли уже такой пользователь
            if User.objects.filter(username='admin_teacher').exists():
                self.stdout.write(self.style.WARNING(
                    'Пользователь admin_teacher уже существует'
                ))
                return

            # Создаем пользователя с ролью администратора
            admin = User.objects.create_user(
                username='admin_teacher',
                password='admin123',
                email='admin_teacher@educonnect.com',
                first_name='Администратор',
                last_name='Учитель',
                role=User.ADMIN,
                is_staff=True,  # Даем доступ к админ-панели
                is_active=True
            )
            
            # Обновляем профиль администратора
            admin_profile = admin.adminuser
            admin_profile.admin_type = AdminUser.ADMIN_TEACHER
            admin_profile.is_super_admin = False
            admin_profile.save()
            
            self.stdout.write(self.style.SUCCESS(
                f'Успешно создан администратор-учитель: {admin.username}\n'
                f'Email: {admin.email}\n'
                f'Пароль: admin123'
            ))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'Ошибка при создании администратора-учителя: {str(e)}'
            )) 