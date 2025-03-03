from django.db import models
from education_core.models import User

# Create your models here.

class StudentUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='student_profile')
    # Приведем в соответствие с фронтендом
    firstName = models.CharField('Имя', max_length=150)  # Оставляем как есть для совместимости
    lastName = models.CharField('Фамилия', max_length=150)  # Оставляем как есть для совместимости
    middleName = models.CharField('Отчество', max_length=150, blank=True)  # Оставляем как есть для совместимости
    grade = models.CharField('Класс', max_length=10)
    index = models.CharField('Индекс класса', max_length=5)
    subject = models.CharField('Предмет', max_length=100, blank=True)
    role = models.CharField('Роль', max_length=10, choices=[('student', 'Ученик')], default='student')
    
    class Meta:
        verbose_name = 'Ученик'
        verbose_name_plural = 'Ученики'
        
    def __str__(self):
        name = f"{self.lastName} {self.firstName}"
        if self.middleName:
            name += f" {self.middleName}"
        return f"{name} - {self.grade}{self.index}"
