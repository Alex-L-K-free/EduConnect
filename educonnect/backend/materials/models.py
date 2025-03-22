from django.db import models
import os
from subjects.models import Subject
from education_core.models import User
from users_student.models import StudentUser

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
    created_by = models.ForeignKey(
        User, 
        verbose_name='Автор', 
        on_delete=models.CASCADE, 
        related_name='created_materials',  # Изменено на уникальное имя
        related_query_name='material'  # Добавлен уникальный query_name
    )
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        db_table = 'materials'
        ordering = ['-created_at']
        verbose_name = 'Учебный материал'
        verbose_name_plural = 'Учебные материалы'

def student_material_path(instance, filename):
    # Получаем предмет и класс студента
    subject = instance.student.subject
    grade = instance.student.grade
    grade_letter = instance.student.index or ''
    
    # Формируем путь: предмет/класс/год/месяц/день/файл
    return os.path.join(
        'student_materials',
        subject,
        f'{grade}{grade_letter}',
        instance.created_by.username,
        f'{instance.created_at.year}',
        f'{instance.created_at.month:02d}',
        f'{instance.created_at.day:02d}',
        filename
    )

class StudentMaterial(models.Model):
    student = models.ForeignKey(StudentUser, on_delete=models.CASCADE, related_name='student_materials')
    title = models.CharField('Название', max_length=255)
    description = models.TextField('Описание', blank=True)
    file = models.FileField('Файл', upload_to=student_material_path)
    material_type = models.CharField('Тип материала', max_length=20, choices=[
        ('document', 'Документ'),
        ('video', 'Видео'),
        ('presentation', 'Презентация'),
        ('other', 'Другое'),
    ], default='document')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_student_materials',
        related_query_name='student_material'
    )
    is_viewed = models.BooleanField('Просмотрено', default=False)

    class Meta:
        db_table = 'student_materials'
        ordering = ['-created_at']
