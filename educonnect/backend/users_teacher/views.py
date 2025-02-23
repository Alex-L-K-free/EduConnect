from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from education_core.models import User
from .models import TeacherUser
from .serializers import TeacherRegistrationSerializer, TeacherListSerializer
from django.contrib.auth.hashers import check_password
from subjects.models import Subject, TeacherSubject
from .serializers import TeacherProfileSerializer, SubjectSerializer
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

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def teacher_profile(request):
    try:
        teacher = TeacherUser.objects.get(user=request.user)
    except TeacherUser.DoesNotExist:
        return Response(
            {'error': 'Профиль учителя не найден'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'PUT':
        logger.debug(f"Received PUT request data: {request.data}")
        
        # Обновляем данные пользователя
        user = teacher.user
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            user.email = request.data['email']
        user.save()
        
        # Обновляем данные учителя
        teacher_data = {
            'telegram': request.data.get('telegram', teacher.telegram),
            'viber': request.data.get('viber', teacher.viber),
            'about': request.data.get('about', teacher.about),
            'specialization': request.data.get('specialization', teacher.specialization)
        }
        
        serializer = TeacherProfileSerializer(teacher, data=teacher_data, partial=True)
        if serializer.is_valid():
            try:
                updated_teacher = serializer.save()
                response_data = TeacherProfileSerializer(updated_teacher).data
                logger.debug(f"Updated profile response: {response_data}")
                return Response(response_data)
            except Exception as e:
                logger.error(f"Error updating teacher profile: {str(e)}")
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        logger.error(f"Serializer validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # GET request
    serializer = TeacherProfileSerializer(teacher)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    if request.user.role != User.TEACHER:
        return Response(
            {'error': 'Доступ запрещен'},
            status=status.HTTP_403_FORBIDDEN
        )

    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    if not check_password(current_password, request.user.password):
        return Response(
            {'error': 'Неверный текущий пароль'},
            status=status.HTTP_400_BAD_REQUEST
        )

    request.user.set_password(new_password)
    request.user.save()
    return Response({'message': 'Пароль успешно изменен'})

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_subjects(request):
    if request.user.role != User.TEACHER:
        return Response(
            {'error': 'Доступ запрещен'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'POST':
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            subject = serializer.save()
            TeacherSubject.objects.create(
                teacher=request.user,
                subject=subject
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        subject_id = request.data.get('subject_id')
        try:
            teacher_subject = TeacherSubject.objects.get(
                teacher=request.user,
                subject_id=subject_id
            )
            teacher_subject.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TeacherSubject.DoesNotExist:
            return Response(
                {'error': 'Предмет не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
