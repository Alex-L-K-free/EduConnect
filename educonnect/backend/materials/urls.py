from django.urls import path
from . import views

app_name = 'materials'

urlpatterns = [
    path('add/', views.add_material, name='add-material'),
    path('student/<int:student_id>/', views.get_student_materials, name='student-materials'),
    path('mark-viewed/<int:material_id>/', views.mark_material_viewed, name='mark-material-viewed'),
]
