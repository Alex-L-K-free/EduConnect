from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from education_core.models import User
from users_student.models import StudentUser
from .models import StudentMaterial
from .serializers import StudentMaterialSerializer
import logging
import json
import os
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_material(request):
    if request.user.role != User.TEACHER:
        return Response(
            {'error': 'Только учителя могут добавлять материалы'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        file = request.FILES.get('file')
        student_ids = json.loads(request.data.get('student_ids', '[]'))
        
        if not file:
            return Response(
                {'error': 'Файл не предоставлен'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Определяем тип материала по расширению
        file_ext = os.path.splitext(file.name)[1].lower()
        material_type = 'document'
        if file_ext in ['.mp4', '.avi', '.mov']:
            material_type = 'video'
        elif file_ext in ['.ppt', '.pptx']:
            material_type = 'presentation'

        created_materials = []
        current_time = timezone.now()  # Используем одно время для всех материалов
        
        for student_id in student_ids:
            try:
                student = StudentUser.objects.get(id=student_id)
                material = StudentMaterial(
                    student=student,
                    title=file.name,
                    description=request.data.get('description', ''),
                    file=file,
                    material_type=material_type,
                    created_by=request.user,
                    created_at=current_time  # Устанавливаем время создания
                )
                material.save()
                created_materials.append(material)
            except StudentUser.DoesNotExist:
                logger.warning(f"Student with id {student_id} not found")
                continue

        # Возвращаем первый созданный материал как образец
        if created_materials:
            serializer = StudentMaterialSerializer(created_materials[0], context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(
            {'error': 'Не удалось создать материалы'},
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        logger.error(f"Error adding material: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_materials(request, student_id):
    try:
        student = StudentUser.objects.get(id=student_id)
        materials = StudentMaterial.objects.filter(student=student)
        serializer = StudentMaterialSerializer(materials, many=True, context={'request': request})
        return Response(serializer.data)
    except StudentUser.DoesNotExist:
        return Response(
            {'error': 'Студент не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error getting materials: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_material_viewed(request, material_id):
    try:
        material = StudentMaterial.objects.get(id=material_id)
        material.is_viewed = True
        material.save()
        serializer = StudentMaterialSerializer(material)
        return Response(serializer.data)
    except StudentMaterial.DoesNotExist:
        return Response(
            {'error': 'Материал не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
