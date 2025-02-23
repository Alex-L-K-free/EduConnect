from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.

class TeacherUser(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='teacher_profile'
    )
    telegram = models.CharField(max_length=100, blank=True, default='')
    viber = models.CharField(max_length=100, blank=True, default='')
    about = models.TextField(blank=True, default='')
    specialization = models.CharField(max_length=200, blank=True, default='')

    class Meta:
        verbose_name = 'Teacher Profile'
        verbose_name_plural = 'Teacher Profiles'

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"

    @property
    def first_name(self):
        return self.user.first_name

    @property
    def last_name(self):
        return self.user.last_name

    @property
    def email(self):
        return self.user.email
