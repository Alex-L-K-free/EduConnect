from django.db import models
from education_core.models import User

# Create your models here.

class AdminUser(models.Model):
    SUPER_ADMIN = 'super_admin'
    ADMIN_TEACHER = 'admin_teacher'
    
    ADMIN_TYPES = [
        (SUPER_ADMIN, 'Суперадминистратор'),
        (ADMIN_TEACHER, 'Администратор-учитель'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    admin_type = models.CharField('Тип администратора', max_length=20, choices=ADMIN_TYPES)
    is_super_admin = models.BooleanField('Суперадминистратор', default=False)
    
    class Meta:
        verbose_name = 'Администратор'
        verbose_name_plural = 'Администраторы'
        
    def __str__(self):
        return f"{self.get_admin_type_display()}: {self.user.get_full_name() or self.user.username}"
