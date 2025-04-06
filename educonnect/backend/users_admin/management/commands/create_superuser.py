from django.core.management.base import BaseCommand
from education_core.models import User
from users_admin.models import AdminUser

class Command(BaseCommand):
    help = 'Создает суперпользователя с предустановленными учетными данными'

    def handle(self, *args, **kwargs):
        try:
            # Проверяем, существует ли уже такой пользователь
            if User.objects.filter(username='admin').exists():
                self.stdout.write(self.style.WARNING(
                    'Суперпользователь admin уже существует'
                ))
                return

            # Создаем суперпользователя
            superuser = User.objects.create_superuser(
                username='admin',
                password='admin',
                email='admin@educonnect.com',
                first_name='Главный',
                last_name='Администратор',
                role=User.ADMIN,
            )
            
            # Обновляем профиль администратора
            admin_profile = superuser.adminuser
            admin_profile.admin_type = AdminUser.SUPER_ADMIN
            admin_profile.is_super_admin = True
            admin_profile.save()
            
            self.stdout.write(self.style.SUCCESS(
                f'Успешно создан суперпользователь: {superuser.username}\n'
                f'Email: {superuser.email}\n'
                f'Пароль: admin'
            ))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'Ошибка при создании суперпользователя: {str(e)}'
            )) 