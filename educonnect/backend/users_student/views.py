from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from education_core.models import User
from .models import StudentUser
from .serializers import StudentSerializer
from django.db.models import Q
from education_core.constants import (
    STUDENT_FIRST_NAME, STUDENT_LAST_NAME, STUDENT_MIDDLE_NAME,
    EXISTS, MESSAGE
)

# Create your views here.

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def student_list(request):
    if request.method == 'GET':
        # Получаем только учеников, принадлежащих текущему учителю
        students = StudentUser.objects.filter(teacher=request.user)
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        print("Received data:", request.data)
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            print("Data is valid")
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def student_detail(request, pk):
    try:
        student = StudentUser.objects.get(pk=pk)
    except StudentUser.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudentSerializer(student)
        return Response(serializer.data)

    elif request.method == 'PUT':
        print("Received data for update:", request.data)  # Отладочная информация
        serializer = StudentSerializer(student, data=request.data)
        if serializer.is_valid():
            updated_student = serializer.save()
            print("Updated student:", StudentSerializer(updated_student).data)  # Отладочная информация
            return Response(serializer.data)
        print("Validation errors:", serializer.errors)  # Отладочная информация
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
@permission_classes([IsAuthenticated])
def register_student(request):
    # Проверяем, что запрос делает учитель
    if request.user.role != User.TEACHER:
        return Response(
            {'error': 'Только учитель может регистрировать учеников'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            student = serializer.save(teacher=request.user)  # Присваиваем текущего учителя
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_student(request):
    # Проверяем, что запрос делает учитель
    if request.user.role != User.TEACHER:
        return Response(
            {'error': 'Только учитель может добавлять учеников'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            student = serializer.save(teacher=request.user)  # Присваиваем текущего учителя
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
