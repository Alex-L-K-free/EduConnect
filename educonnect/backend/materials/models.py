from django.db import models
import os
from subjects.models import Subject
from education_core.models import User
from users_student.models import StudentUser
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

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
    """
    Функция для определения пути сохранения файла материала ученика
    """
    try:
        # Получаем данные о ученике
        student = instance.student
        subject_name = instance.subject_name if instance.subject_name else student.subject
        grade = student.grade if student.grade else 'unknown'
        grade_letter = student.index if student.index else ''
        
        # Получаем текущую дату
        now = timezone.now()
        
        # Если subject_name == 'other', сохраняем в teacher_materials
        if subject_name == 'other':
            path = os.path.join(
                'teacher_materials',
                student.username,
                str(subject_name),
                f'{grade}{grade_letter}',
                str(now.year),
                f'{now.month:02d}',
                filename
            )
        else:
            # Иначе сохраняем в student_materials как раньше
            path = os.path.join(
                'student_materials',
                str(subject_name),
                f'{grade}{grade_letter}',
                student.username,
                str(now.year),
                f'{now.month:02d}',
                filename
            )
        return path
    except Exception as e:
        logger.error(f"Error in student_material_path: {str(e)}")
        # В случае ошибки сохраняем в teacher_materials
        return os.path.join('teacher_materials', 'other', filename)

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
        StudentUser,  # Возвращаем тип StudentUser
        on_delete=models.CASCADE, 
        related_name='created_student_materials',
        related_query_name='student_material'
    )
    is_viewed = models.BooleanField('Просмотрено', default=False)
    is_student_material = models.BooleanField('Загружено учеником', default=False)
    subject_name = models.CharField('Предмет', max_length=255, blank=True, null=True)  # Добавляем поле для предмета

    class Meta:
        db_table = 'student_materials'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.student}"

    def delete(self, *args, **kwargs):
        if self.file:
            storage = self.file.storage
            if storage.exists(self.file.name):
                storage.delete(self.file.name)
        super().delete(*args, **kwargs)
