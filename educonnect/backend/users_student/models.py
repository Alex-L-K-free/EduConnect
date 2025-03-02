from django.db import models
from education_core.models import User

# Create your models here.

class StudentUser(models.Model):
    STUDENT = 'student'
    
    ROLE_CHOICES = [
        (STUDENT, 'Ученик'),
    ]
    
    # Автоматически создаваемый ID будет первичным ключом
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='student_profile'
    )
    firstName = models.CharField('Имя', max_length=150)
    lastName = models.CharField('Фамилия', max_length=150)
    middleName = models.CharField('Отчество', max_length=150, blank=True)
    grade = models.CharField('Класс', max_length=10)
    index = models.CharField('Индекс класса', max_length=5)
    subject = models.CharField('Предмет', max_length=100, blank=True)
    role = models.CharField(
        'Роль',
        max_length=10,
        choices=ROLE_CHOICES,
        default=STUDENT
    )
    
    class Meta:
        verbose_name = 'Ученик'
        verbose_name_plural = 'Ученики'
        
    def __str__(self):
        name = f"{self.lastName} {self.firstName}"
        if self.middleName:
            name += f" {self.middleName}"
        return f"{name} - {self.grade}{self.index}"
