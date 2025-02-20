from django.db import models
from education_core.models import User

class Subject(models.Model):
    name = models.CharField('Название', max_length=100)
    description = models.TextField('Описание')
    code = models.CharField('Код предмета', max_length=20, unique=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        db_table = 'subjects'
        ordering = ['name']
        verbose_name = 'Предмет'
        verbose_name_plural = 'Предметы'
    
    def __str__(self):
        return self.name

class SubjectEnrollment(models.Model):
    subject = models.ForeignKey(Subject, verbose_name='Предмет', on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(User, verbose_name='Студент', on_delete=models.CASCADE, related_name='subject_enrollments')
    enrolled_at = models.DateTimeField('Дата записи', auto_now_add=True)
    
    class Meta:
        db_table = 'subject_enrollments'
        unique_together = ['subject', 'student']
        verbose_name = 'Запись на предмет'
        verbose_name_plural = 'Записи на предметы'

class TeacherSubject(models.Model):
    subject = models.ForeignKey(Subject, verbose_name='Предмет', on_delete=models.CASCADE, related_name='teachers')
    teacher = models.ForeignKey(User, verbose_name='Преподаватель', on_delete=models.CASCADE, related_name='teaching_subjects')
    assigned_at = models.DateTimeField('Дата назначения', auto_now_add=True)
    
    class Meta:
        db_table = 'teacher_subjects'
        unique_together = ['subject', 'teacher']
        verbose_name = 'Назначение преподавателя'
        verbose_name_plural = 'Назначения преподавателей'
