from django.db import models
from education_core.models import User
from django.contrib.auth.hashers import make_password
from django.db.models import JSONField
from subjects.models import Subject, SubjectEnrollment
import logging

logger = logging.getLogger(__name__)

# Create your models here.

class StudentUser(models.Model):
    STUDENT = 'student'
    ROLE_CHOICES = [
        (STUDENT, 'Ученик'),
    ]
    
    username = models.CharField('Логин', max_length=150, null=True, blank=True)
    password = models.CharField('Пароль', max_length=128, null=True, blank=True)
    firstName = models.CharField('Имя', max_length=150)
    lastName = models.CharField('Фамилия', max_length=150)
    middleName = models.CharField('Отчество', max_length=150, blank=True)
    grade = models.CharField('Класс', max_length=10)
    index = models.CharField('Индекс класса', max_length=5)
    subject = models.CharField('Предмет', max_length=100, blank=True)  # Оставляем для обратной совместимости
    subjects = models.ManyToManyField(Subject, through='subjects.SubjectEnrollment', related_name='enrolled_students')
    role = models.CharField('Роль', max_length=10, choices=ROLE_CHOICES, default=STUDENT)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='students', null=True, blank=True)
    auth_token = models.CharField(max_length=64, null=True, blank=True, unique=True)
    about = models.TextField('О себе', blank=True, null=True)
    contacts = JSONField('Контакты', default=dict, blank=True)
    
    class Meta:
        verbose_name = 'Ученик'
        verbose_name_plural = 'Ученики'
        
    def __str__(self):
        name = f"{self.lastName} {self.firstName}"
        if self.middleName:
            name += f" {self.middleName}"
        return f"{name} - {self.grade}{self.index}"

    def set_password(self, raw_password):
        self.password = make_password(raw_password)
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_anonymous(self):
        return False
        
    def get_username(self):
        return self.username

    def get_subjects(self):
        """Получить все предметы студента"""
        logger.debug(f"Getting subjects for student {self.username}")
        
        # Получаем все записи студентов с таким же username
        student_records = StudentUser.objects.filter(username=self.username)
        logger.debug(f"Found {student_records.count()} student records with username {self.username}")
        
        # Получаем предметы из связи many-to-many для всех записей
        enrolled_subjects = []
        for student in student_records:
            enrolled_subjects.extend(list(student.subjects.all()))
        logger.debug(f"Enrolled subjects: {[s.name for s in enrolled_subjects]}")
        
        # Получаем предметы из legacy поля subject для всех записей
        legacy_subjects = []
        for student in student_records:
            if student.subject:
                legacy_subject_names = student.subject.split(',')
                logger.debug(f"Legacy subject names: {legacy_subject_names}")
                legacy_subjects.extend(list(Subject.objects.filter(name__in=legacy_subject_names)))
        logger.debug(f"Legacy subjects found: {[s.name for s in legacy_subjects]}")
        
        # Объединяем результаты и удаляем дубликаты
        all_subjects = list(set(enrolled_subjects + legacy_subjects))
        logger.debug(f"Updated enrolled subjects: {[s.name for s in all_subjects]}")
        
        return all_subjects
