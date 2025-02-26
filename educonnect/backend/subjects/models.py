from django.db import models
from education_core.models import User

class Subject(models.Model):
    name = models.CharField('Название', max_length=100)
    grade = models.CharField('Класс', max_length=20)
    index = models.CharField(max_length=1, verbose_name='Индекс класса', blank=True, null=True)
    code = models.CharField('Код предмета', max_length=50, unique=True, editable=False)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        db_table = 'subjects'
        ordering = ['name']
        verbose_name = 'Предмет'
        verbose_name_plural = 'Предметы'
    
    def save(self, *args, **kwargs):
        # Формируем код предмета автоматически
        self.code = f"{self.name.lower().replace(' ', '_')}-{self.grade}-{self.index}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} - {self.grade} класс"

class SubjectEnrollment(models.Model):
    subject = models.ForeignKey(Subject, verbose_name='Предмет', on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(User, verbose_name='Ученик', on_delete=models.CASCADE, related_name='subject_enrollments')
    enrolled_at = models.DateTimeField('Дата записи', auto_now_add=True)
    
    class Meta:
        db_table = 'subject_enrollments'
        unique_together = ['subject', 'student']
        verbose_name = 'Запись на предмет'
        verbose_name_plural = 'Записи на предметы'

class TeacherSubject(models.Model):
    subject = models.ForeignKey(Subject, verbose_name='Предмет', on_delete=models.CASCADE, related_name='teachers')
    teacher = models.ForeignKey(User, verbose_name='Учитель', on_delete=models.CASCADE, related_name='teaching_subjects')
    assigned_at = models.DateTimeField('Дата назначения', auto_now_add=True)
    
    class Meta:
        db_table = 'teacher_subjects'
        unique_together = ['subject', 'teacher']
        verbose_name = 'Назначение учителя'
        verbose_name_plural = 'Назначения учителя'
