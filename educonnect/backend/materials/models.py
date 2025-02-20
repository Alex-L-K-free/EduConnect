from django.db import models
from subjects.models import Subject
from education_core.models import User

class Material(models.Model):
    DOCUMENT = 'document'
    VIDEO = 'video'
    PRESENTATION = 'presentation'
    LINK = 'link'
    
    MATERIAL_TYPES = [
        (DOCUMENT, 'Документ'),
        (VIDEO, 'Видео'),
        (PRESENTATION, 'Презентация'),
        (LINK, 'Внешняя ссылка'),
    ]
    
    title = models.CharField('Название', max_length=200)
    description = models.TextField('Описание')
    subject = models.ForeignKey(Subject, verbose_name='Предмет', on_delete=models.CASCADE, related_name='materials')
    material_type = models.CharField('Тип материала', max_length=20, choices=MATERIAL_TYPES)
    file = models.FileField('Файл', upload_to='materials/', null=True, blank=True)
    external_link = models.URLField('Внешняя ссылка', null=True, blank=True)
    created_by = models.ForeignKey(User, verbose_name='Автор', on_delete=models.CASCADE, related_name='uploaded_materials')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        db_table = 'materials'
        ordering = ['-created_at']
        verbose_name = 'Учебный материал'
        verbose_name_plural = 'Учебные материалы'
