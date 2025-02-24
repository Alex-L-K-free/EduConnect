from django.urls import path
from . import views

app_name = 'subjects'

urlpatterns = [
    path('', views.subject_list, name='subject-list'),
    path('<int:subject_id>/', views.subject_detail, name='subject-detail'),
    path('<int:subject_id>/enroll/', views.enroll_subject, name='subject-enroll'),
] 