from django.urls import path
from .views import StudentListView, StudentCreateView

urlpatterns = [
    path('', StudentListView.as_view(), name='student-list'),
    path('bulk/', StudentCreateView.as_view(), name='bulk-add-students'),
] 