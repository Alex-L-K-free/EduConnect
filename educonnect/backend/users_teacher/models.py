from django.db import models
from django.conf import settings

# Create your models here.

class TeacherUser(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True
    )
    specialization = models.CharField(
        'Специализация',
        max_length=100,
        blank=True
    )
    telegram = models.CharField(
        'Telegram',
        max_length=100,
        blank=True
    )
    viber = models.CharField(
        'Viber',
        max_length=100,
        blank=True
    )
    about = models.TextField(
        'О себе',
        blank=True
    )
    
    class Meta:
        verbose_name = 'Учитель'
        verbose_name_plural = 'Учителя'
        
    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name}'
