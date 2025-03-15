from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from education_core.models import User
from .models import StudentUser
from .serializers import StudentSerializer, StudentLoginSerializer
from django.db.models import Q
from education_core.constants import (
    STUDENT_FIRST_NAME, STUDENT_LAST_NAME, STUDENT_MIDDLE_NAME,
    EXISTS, MESSAGE
)
from django.contrib.auth import authenticate

# Create your views here.

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def student_list(request):
    if request.method == 'GET':
        # Получаем учеников текущего учителя
        students = StudentUser.objects.filter(teacher=request.user)
        
        # Группируем учеников по ФИО и обновляем логины
        students_by_name = {}
        for student in students:
            key = f"{student.lastName}-{student.firstName}-{student.middleName}"
            if key not in students_by_name:
                students_by_name[key] = []
            students_by_name[key].append(student)

        # Для каждой группы учеников с одинаковым ФИО
        for group in students_by_name.values():
            # Ищем зарегистрированного ученика в группе
            registered_student = next(
                (s for s in group if s.username is not None),
                None
            )
            
            # Если есть зарегистрированный ученик, обновляем остальных
            if registered_student:
                for student in group:
                    if student.username is None:
                        student.username = registered_student.username
                        student.save()

        # Получаем обновленный список
        updated_students = StudentUser.objects.filter(teacher=request.user)
        serializer = StudentSerializer(updated_students, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        print("Received data:", request.data)
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            # Проверяем существование учеников с таким же ФИО
            existing_students = StudentUser.objects.filter(
                firstName=serializer.validated_data['firstName'],
                lastName=serializer.validated_data['lastName'],
                middleName=serializer.validated_data['middleName']
            )

            # Ищем среди них зарегистрированного
            registered_student = existing_students.exclude(username__isnull=True).first()

            # Создаем нового ученика
            new_student = serializer.save()

            # Если найден зарегистрированный ученик, обновляем логин для всех
            if registered_student:
                # Обновляем логин нового ученика
                new_student.username = registered_student.username
                new_student.save()

                # Обновляем логин для всех существующих учеников с таким же ФИО
                existing_students.filter(username__isnull=True).update(
                    username=registered_student.username
                )

            return Response(StudentSerializer(new_student).data, status=status.HTTP_201_CREATED)
        else:
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
@permission_classes([IsAuthenticated])
def student_detail(request, pk):
    try:
        student = StudentUser.objects.get(pk=pk)
    except StudentUser.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudentSerializer(student)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        # Если обновляется логин
        if 'username' in request.data:
            # Обновляем логин для всех учеников с таким же ФИО
            StudentUser.objects.filter(
                firstName=student.firstName,
                lastName=student.lastName,
                middleName=student.middleName,
                username__isnull=True  # только для незарегистрированных
            ).update(username=request.data['username'])

        serializer = StudentSerializer(student, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            updated_student = serializer.save()
            return Response(StudentSerializer(updated_student).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        student.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_student(request):
    """
    Проверяет существование ученика в списке по ФИО
    """
    try:
        lastName = request.data.get('lastName', '').strip()
        firstName = request.data.get('firstName', '').strip()
        middleName = request.data.get('middleName', '').strip()

        # Формируем базовый запрос
        query = Q(lastName=lastName) & Q(firstName=firstName)
        
        # Добавляем отчество в запрос, если оно предоставлено
        if middleName:
            query &= Q(middleName=middleName)

        # Проверяем существование ученика
        student_exists = StudentUser.objects.filter(query).exists()

        return Response({
            EXISTS: student_exists,
            MESSAGE: 'Ученик найден в списке' if student_exists else 'Ученик не найден в списке'
        })

    except Exception as e:
        return Response(
            {'error': f'Ошибка при проверке данных: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    # Проверяем, что данные о ФИО переданы
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    middle_name = request.data.get('middle_name', '')

    # Ищем существующих учеников
    students = StudentUser.objects.filter(firstName=first_name, lastName=last_name, middleName=middle_name)

    if not students.exists():
        return Response({'error': 'Ученик с такими данными не найден'}, status=status.HTTP_404_NOT_FOUND)

    # Обновляем логин и пароль для всех найденных учеников
    username = request.data.get('username')
    password = request.data.get('password')

    for student in students:
        student.username = username
        student.set_password(password)  # Устанавливаем новый пароль
        student.save()

    return Response({'message': 'Логин успешно связан с учениками'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_student(request):
    if request.user.role != User.TEACHER:
        return Response(
            {'error': 'Только учитель может добавлять учеников'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            student = serializer.save(teacher=request.user)  # Убедитесь, что это поле заполняется
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def student_login(request):
    serializer = StudentLoginSerializer(data=request.data)
    if serializer.is_valid():
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
