from django.db import models
from education_core.models import User

class Conversation(models.Model):
    participants = models.ManyToManyField(User, verbose_name='Участники', related_name='conversations')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        db_table = 'conversations'
        verbose_name = 'Диалог'
        verbose_name_plural = 'Диалоги'

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, verbose_name='Диалог', on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, verbose_name='Отправитель', on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField('Содержание')
    created_at = models.DateTimeField('Дата отправки', auto_now_add=True)
    read_by = models.ManyToManyField(User, verbose_name='Прочитано', related_name='read_messages')
    
    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
