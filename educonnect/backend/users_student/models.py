from django.db import models
from education_core.models import User

# Create your models here.

class StudentUser(models.Model):
    STUDENT = 'student'
    ROLE_CHOICES = [
        (STUDENT, 'Ученик'),
    ]
    
    user = models.ForeignKey(  # Меняем OneToOneField на ForeignKey
        User, 
        on_delete=models.CASCADE,
        related_name='student_profiles',  # Меняем related_name
        null=True,
        blank=True
    )
    # Приведем в соответствие с фронтендом
    firstName = models.CharField('Имя', max_length=150)  # Оставляем как есть для совместимости
    lastName = models.CharField('Фамилия', max_length=150)  # Оставляем как есть для совместимости
    middleName = models.CharField('Отчество', max_length=150, blank=True)  # Оставляем как есть для совместимости
    grade = models.CharField('Класс', max_length=10)
    index = models.CharField('Индекс класса', max_length=5)
    subject = models.CharField('Предмет', max_length=100, blank=True)
    role = models.CharField('Роль', max_length=10, choices=ROLE_CHOICES, default=STUDENT)
    
    class Meta:
        verbose_name = 'Ученик'
        verbose_name_plural = 'Ученики'
        
    def __str__(self):
        name = f"{self.lastName} {self.firstName}"
        if self.middleName:
            name += f" {self.middleName}"
        return f"{name} - {self.grade}{self.index}"
