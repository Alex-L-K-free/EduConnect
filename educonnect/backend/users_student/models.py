from django.db import models
from education_core.models import User

# Create your models here.

class StudentUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    grade = models.CharField('Класс', max_length=10)
    index = models.CharField('Индекс класса', max_length=5)
    subject = models.CharField('Предмет', max_length=100, blank=True)
    
    class Meta:
        verbose_name = 'Ученик'
        verbose_name_plural = 'Ученики'
        
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.grade}{self.index}"
