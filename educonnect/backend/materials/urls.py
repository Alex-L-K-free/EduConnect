from django.urls import path
from . import views

app_name = 'materials'

urlpatterns = [
    path('add/', views.add_material, name='add-material'),
    path('student/<int:student_id>/', views.get_student_materials, name='student-materials'),
    path('students/', views.get_students_materials, name='students-materials'),  # Новый endpoint
    path('mark-viewed/<int:material_id>/', views.mark_material_viewed, name='mark-material-viewed'),
    path('delete/<int:material_id>/', views.delete_material, name='delete-material'),
]
