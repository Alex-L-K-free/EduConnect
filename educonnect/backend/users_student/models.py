from django.db import models
from education_core.models import User
from django.contrib.auth.hashers import make_password
from django.db.models import JSONField  # Добавляем импорт

# Create your models here.

class StudentUser(models.Model):
    STUDENT = 'student'
    ROLE_CHOICES = [
        (STUDENT, 'Ученик'),
    ]
    
    username = models.CharField('Логин', max_length=150, null=True, blank=True)
    password = models.CharField('Пароль', max_length=128, null=True, blank=True)
    firstName = models.CharField('Имя', max_length=150)
    lastName = models.CharField('Фамилия', max_length=150)
    middleName = models.CharField('Отчество', max_length=150, blank=True)
    grade = models.CharField('Класс', max_length=10)
    index = models.CharField('Индекс класса', max_length=5)
    subject = models.CharField('Предмет', max_length=100, blank=True)
    role = models.CharField('Роль', max_length=10, choices=ROLE_CHOICES, default=STUDENT)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='students', null=True, blank=True)
    auth_token = models.CharField(max_length=64, null=True, blank=True, unique=True)
    about = models.TextField('О себе', blank=True, null=True)
    contacts = JSONField('Контакты', default=dict, blank=True)
    
    class Meta:
        verbose_name = 'Ученик'
        verbose_name_plural = 'Ученики'
        
    def __str__(self):
        name = f"{self.lastName} {self.firstName}"
        if self.middleName:
            name += f" {self.middleName}"
        return f"{name} - {self.grade}{self.index}"

    def set_password(self, raw_password):
        self.password = make_password(raw_password)
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_anonymous(self):
        return False
        
    def get_username(self):
        return self.username
