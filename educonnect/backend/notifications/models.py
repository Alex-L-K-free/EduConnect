from django.db import models
from education_core.models import User

class Notification(models.Model):
    ASSIGNMENT = 'assignment'
    MESSAGE = 'message'
    SYSTEM = 'system'
    
    NOTIFICATION_TYPES = [
        (ASSIGNMENT, 'Задание'),
        (MESSAGE, 'Сообщение'),
        (SYSTEM, 'Системное'),
    ]
    
    user = models.ForeignKey(User, verbose_name='Пользователь', on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField('Заголовок', max_length=200)
    message = models.TextField('Сообщение')
    notification_type = models.CharField('Тип уведомления', max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField('Прочитано', default=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'
