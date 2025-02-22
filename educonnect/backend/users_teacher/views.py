from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from education_core.models import User
from .models import TeacherUser
from .serializers import TeacherRegistrationSerializer, TeacherListSerializer
import logging

logger = logging.getLogger(__name__)

# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_teacher(request):
    # Логируем входящие данные
    logger.debug(f"Request data: {request.data}")
    logger.debug(f"User role: {request.user.role}")
    
    # Проверяем, что запрос делает администратор
    if request.user.role != User.ADMIN:
        return Response(
            {'error': 'Только администратор может регистрировать учителей'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        serializer = TeacherRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            teacher = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Error in register_teacher view")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_list(request):
    if request.user.role != User.ADMIN:
        return Response(
            {'error': 'Только администратор может просматривать список учителей'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    teachers = TeacherUser.objects.all()
    serializer = TeacherListSerializer(teachers, many=True)
    return Response(serializer.data)
