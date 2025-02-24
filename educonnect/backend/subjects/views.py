from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from education_core.models import User
from .models import Subject, TeacherSubject, SubjectEnrollment
from .serializers import SubjectSerializer, TeacherSubjectSerializer, SubjectEnrollmentSerializer
import logging

logger = logging.getLogger(__name__)

# Create your views here.

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def subject_list(request):
    logger.debug(f"Subject list request from user {request.user.username} with role {request.user.role}")
    if request.method == 'GET':
        if request.user.role == User.TEACHER:
            subjects = Subject.objects.filter(teachers__teacher=request.user)
        elif request.user.role == User.STUDENT:
            subjects = Subject.objects.filter(enrollments__student=request.user)
        else:
            subjects = Subject.objects.all()
        
        serializer = SubjectSerializer(subjects, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if request.user.role != User.TEACHER:
            return Response(
                {'error': 'Только учителя могут создавать предметы'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = SubjectSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            subject = serializer.save()
            TeacherSubject.objects.create(teacher=request.user, subject=subject)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def subject_detail(request, subject_id):
    logger.debug(f"Delete subject {subject_id} request from user {request.user.username}")
    try:
        subject = Subject.objects.get(id=subject_id)
    except Subject.DoesNotExist:
        return Response(
            {'error': 'Предмет не найден'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Проверяем роль пользователя
    if request.user.role not in [User.TEACHER, User.ADMIN]:
        return Response(
            {'error': 'У вас нет прав на удаление предметов'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.user.role == User.TEACHER:
        if not TeacherSubject.objects.filter(teacher=request.user, subject=subject).exists():
            return Response(
                {'error': 'У вас нет прав на удаление этого предмета'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    subject.delete()
    return Response({'message': 'Предмет успешно удален'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_subject(request, subject_id):
    logger.debug(f"Enroll request for subject {subject_id} from student {request.user.username}")
    if request.user.role != User.STUDENT:
        return Response(
            {'error': 'Только ученики могут записываться на предметы'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        subject = Subject.objects.get(id=subject_id)
        if SubjectEnrollment.objects.filter(student=request.user, subject=subject).exists():
            return Response(
                {'error': 'Вы уже записаны на этот предмет'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        SubjectEnrollment.objects.create(student=request.user, subject=subject)
        return Response({'message': 'Вы успешно записались на предмет'}, status=status.HTTP_201_CREATED)
    except Subject.DoesNotExist:
        return Response(
            {'error': 'Предмет не найден'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def subject_detail(request, subject_id):
    try:
        subject = Subject.objects.get(id=subject_id)
    except Subject.DoesNotExist:
        return Response(
            {'error': 'Предмет не найден'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.user.role == User.TEACHER:
        if not TeacherSubject.objects.filter(teacher=request.user, subject=subject).exists():
            return Response(
                {'error': 'У вас нет прав на редактирование этого предмета'},
                status=status.HTTP_403_FORBIDDEN
            )

    serializer = SubjectSerializer(subject, data=request.data, context={'request': request})
    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
