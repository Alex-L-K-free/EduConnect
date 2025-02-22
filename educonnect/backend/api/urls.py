from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import LoginView
from users_teacher.views import register_teacher, teacher_list

router = DefaultRouter()
router.register(r'users', views.UserViewSet)

app_name = 'api'

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('teachers/', teacher_list, name='teacher-list'),
    path('teachers/register/', register_teacher, name='register-teacher'),
    # Здесь будем добавлять другие URL-паттерны
] 