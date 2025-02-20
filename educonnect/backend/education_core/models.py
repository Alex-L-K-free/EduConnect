from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

phone_validator = RegexValidator(
    regex=r'^\+?1?\d{9,15}$',
    message="Номер телефона должен быть в формате: '+999999999'. Допускается до 15 цифр."
)

class User(AbstractUser):
    ADMIN = 'admin'
    TEACHER = 'teacher'
    STUDENT = 'student'
    
    ROLE_CHOICES = [
        (ADMIN, 'Администратор'),
        (TEACHER, 'Учитель'),
        (STUDENT, 'Ученик'),
    ]
    
    email = models.EmailField('Email', unique=True)
    phone = models.CharField('Телефон', max_length=16, validators=[phone_validator], blank=True)
    role = models.CharField('Роль', max_length=10, choices=ROLE_CHOICES)
    avatar = models.ImageField('Фото профиля', upload_to='avatars/', null=True, blank=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def save(self, *args, **kwargs):
        creating = self._state.adding
        super().save(*args, **kwargs)
        
        if creating:
            from users_admin.models import AdminUser
            from users_teacher.models import TeacherUser
            from users_student.models import StudentUser
            
            if self.role == self.ADMIN:
                AdminUser.objects.create(user=self)
            elif self.role == self.TEACHER:
                TeacherUser.objects.create(user=self)
            elif self.role == self.STUDENT:
                StudentUser.objects.create(user=self)
