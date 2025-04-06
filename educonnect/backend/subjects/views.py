from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from education_core.models import User
from users_student.models import StudentUser
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
            try:
                student = StudentUser.objects.get(username=request.user.username)
                # Получаем предметы из связи many-to-many
                enrolled_subjects = student.subjects.all()
                # Получаем предметы из legacy поля
                legacy_subjects = []
                if student.subject:
                    legacy_subject_names = student.subject.split(',')
                    legacy_subjects = Subject.objects.filter(name__in=legacy_subject_names)
                # Объединяем результаты
                subjects = (enrolled_subjects | legacy_subjects).distinct()
            except StudentUser.DoesNotExist:
                subjects = Subject.objects.none()
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

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def subject_detail(request, subject_id):
    try:
        subject = Subject.objects.get(id=subject_id)
    except Subject.DoesNotExist:
        return Response(
            {'error': 'Предмет не найден'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'DELETE':
        if request.user.role == User.TEACHER:
            if not TeacherSubject.objects.filter(teacher=request.user, subject=subject).exists():
                return Response(
                    {'error': 'У вас нет прав на удаление этого предмета'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        subject.delete()
        return Response({'message': 'Предмет успешно удален'}, status=status.HTTP_204_NO_CONTENT)

    elif request.method == 'PUT':
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

    return Response(
        {'error': 'Метод не поддерживается'},
        status=status.HTTP_405_METHOD_NOT_ALLOWED
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_subject(request, subject_id):
    logger.debug(f"Enroll request for subject {subject_id} from student {request.user.username}")
    if request.user.role != User.STUDENT:
        logger.warning(f"Non-student user {request.user.username} tried to enroll in subject {subject_id}")
        return Response(
            {'error': 'Только ученики могут записываться на предметы'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Получаем студента
        student = StudentUser.objects.get(username=request.user.username)
        logger.debug(f"Found student: {student}")
        
        # Получаем предмет
        subject = Subject.objects.get(id=subject_id)
        logger.debug(f"Found subject: {subject.name}")

        # Проверяем, не записан ли уже студент на этот предмет
        if SubjectEnrollment.objects.filter(student=student, subject=subject).exists():
            logger.warning(f"Student {student} is already enrolled in subject {subject.name}")
            return Response(
                {'error': 'Вы уже записаны на этот предмет'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Создаем новую запись
        enrollment = SubjectEnrollment.objects.create(student=student, subject=subject)
        logger.debug(f"Created enrollment: {enrollment}")
        
        # Обновляем legacy поле subject
        if student.subject:
            current_subjects = [s.strip() for s in student.subject.split(',') if s.strip()]
        else:
            current_subjects = []
            
        if subject.name not in current_subjects:
            current_subjects.append(subject.name)
            student.subject = ','.join(current_subjects)
            student.save()
            logger.debug(f"Updated legacy subject field: {student.subject}")
        
        # Получаем обновленный список предметов
        all_subjects = student.get_subjects()
        subject_names = [s.name for s in all_subjects]
        logger.debug(f"All subjects after enrollment: {subject_names}")
        
        return Response({
            'message': 'Вы успешно записались на предмет',
            'subjects': subject_names
        }, status=status.HTTP_201_CREATED)
    except StudentUser.DoesNotExist:
        logger.error(f"Student not found for username: {request.user.username}")
        return Response(
            {'error': 'Студент не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Subject.DoesNotExist:
        logger.error(f"Subject not found with id: {subject_id}")
        return Response(
            {'error': 'Предмет не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error enrolling student: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
