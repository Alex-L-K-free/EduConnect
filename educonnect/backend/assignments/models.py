from django.db import models
from subjects.models import Subject
from education_core.models import User

# Create your models here.

class Assignment(models.Model):
    title = models.CharField('Название', max_length=200)
    description = models.TextField('Описание')
    subject = models.ForeignKey(Subject, verbose_name='Предмет', on_delete=models.CASCADE, related_name='assignments')
    due_date = models.DateTimeField('Срок сдачи')
    max_score = models.PositiveIntegerField('Максимальный балл')
    created_by = models.ForeignKey(User, verbose_name='Автор', on_delete=models.CASCADE, related_name='created_assignments')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        db_table = 'assignments'
        ordering = ['-due_date']
        verbose_name = 'Задание'
        verbose_name_plural = 'Задания'

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, verbose_name='Задание', on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, verbose_name='Ученик', on_delete=models.CASCADE, related_name='assignment_submissions')
    submitted_at = models.DateTimeField('Дата отправки', auto_now_add=True)
    file = models.FileField('Файл', upload_to='submissions/', null=True, blank=True)
    comment = models.TextField('Комментарий', blank=True)
    score = models.PositiveIntegerField('Оценка', null=True, blank=True)
    feedback = models.TextField('Отзыв учителя', blank=True)
    graded_at = models.DateTimeField('Дата оценки', null=True, blank=True)
    
    class Meta:
        db_table = 'assignment_submissions'
        unique_together = ['assignment', 'student']
        verbose_name = 'Ответ на задание'
        verbose_name_plural = 'Ответы на задания'
