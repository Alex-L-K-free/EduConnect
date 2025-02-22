from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from education_core.models import User
from .serializers import TeacherRegistrationSerializer

# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_teacher(request):
    # Проверяем, что запрос делает администратор
    if request.user.role != User.ADMIN:
        return Response(
            {'error': 'Только администратор может регистрировать учителей'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = TeacherRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        teacher = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
