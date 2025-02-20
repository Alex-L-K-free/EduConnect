from django.db import models
from education_core.models import User

# Create your models here.

class TeacherUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    specialization = models.CharField('Специализация', max_length=100, blank=True)
    
    class Meta:
        verbose_name = 'Учитель'
        verbose_name_plural = 'Учителя'
        
    def __str__(self):
        return self.user.get_full_name() or self.user.username
