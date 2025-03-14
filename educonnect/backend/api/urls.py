from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import LoginView, current_user, StudentLoginView
from users_teacher.views import (
    teacher_profile,
    change_password,
    manage_subjects,
    register_teacher,
    teacher_list
)

router = DefaultRouter()
router.register(r'users', views.UserViewSet)

app_name = 'api'

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('students/login/', StudentLoginView.as_view(), name='student-login'),
    path('teachers/', teacher_list, name='teacher-list'),
    path('teachers/register/', register_teacher, name='register-teacher'),
    path('teachers/profile/', teacher_profile, name='teacher-profile'),
    path('teachers/change-password/', change_password, name='change-password'),
    path('teachers/subjects/', manage_subjects, name='manage-subjects'),
    path('users/me/', current_user, name='current-user'),
    path('subjects/', include('subjects.urls', namespace='subjects')),
    path('students/', include('users_student.urls', namespace='students')),
    # Здесь будем добавлять другие URL-паттерны
] 