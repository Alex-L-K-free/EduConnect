from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from education_core.models import User
from .models import StudentUser
from .serializers import StudentSerializer

# Create your views here.

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def student_list(request):
    if request.method == 'GET':
        students = StudentUser.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if request.user.role != User.TEACHER:
            return Response(
                {'error': 'Только учитель может добавлять учеников'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
        if request.user.role != User.TEACHER:
            return Response(
                {'error': 'Только учитель может редактировать учеников'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = StudentSerializer(student, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if request.user.role != User.TEACHER:
            return Response(
                {'error': 'Только учитель может удалять учеников'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        student.user.delete()  # Это также удалит связанного студента
        return Response(status=status.HTTP_204_NO_CONTENT)
