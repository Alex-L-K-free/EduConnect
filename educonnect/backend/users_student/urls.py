from django.urls import path
from . import views

app_name = 'users_student'

urlpatterns = [
    path('', views.student_list, name='student-list'),
    path('<int:pk>/', views.student_detail, name='student-detail'),
    path('verify/', views.verify_student, name='verify-student'),
    path('register/', views.register_student, name='register-student'),
] 