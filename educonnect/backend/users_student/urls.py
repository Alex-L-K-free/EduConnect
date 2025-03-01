from django.urls import path
from . import views

app_name = 'users_student'

urlpatterns = [
    path('', views.student_list, name='student-list'),
    path('<int:pk>/', views.student_detail, name='student-detail'),
] 