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
        # Добавляем сортировку по дате создания
        materials = StudentMaterial.objects.filter(student=student).order_by('-created_at')
        serializer = StudentMaterialSerializer(
            materials, 
            many=True, 
            context={'request': request}
        )
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_students_materials(request):
    """Получение материалов для нескольких студентов за один запрос"""
    try:
        student_ids = request.query_params.get('student_ids', '').split(',')
        student_ids = [int(id) for id in student_ids if id.isdigit()]
        
        if not student_ids:
            return Response(
                {'error': 'Не указаны ID студентов'},
                status=status.HTTP_400_BAD_REQUEST
            )

        materials_by_student = {}
        materials = StudentMaterial.objects.filter(student_id__in=student_ids).order_by('-created_at')
        
        for material in materials:
            if material.student_id not in materials_by_student:
                materials_by_student[material.student_id] = []
            materials_by_student[material.student_id].append(material)

        # Сериализуем материалы для каждого студента
        result = []
        for student_id in student_ids:
            student_materials = materials_by_student.get(student_id, [])
            serializer = StudentMaterialSerializer(
                student_materials,
                many=True,
                context={'request': request}
            )
            result.append({
                'id': student_id,
                'materials': serializer.data
            })

        return Response(result)

    except Exception as e:
        logger.error(f"Error getting materials for multiple students: {str(e)}")
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
    except Exception as e:
        logger.error(f"Error marking material as viewed: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_material(request, material_id):
    try:
        material = StudentMaterial.objects.get(id=material_id)
        if request.user == material.created_by or request.user.role == User.TEACHER:
            try:
                # Удаляем файл, если он существует
                if material.file:
                    file_path = os.path.join(settings.MEDIA_ROOT, material.file.name)
                    if os.path.exists(file_path):  # Исправлена лишняя скобка
                        os.remove(file_path)
                
                # Удаляем запись из базы данных
                material.delete()
                
                return Response(status=status.HTTP_204_NO_CONTENT)
            except Exception as e:
                logger.error(f"Error while deleting material file: {str(e)}")
                # Если файл не удалось удалить, все равно удаляем запись
                material.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
                
        return Response(
            {'error': 'У вас нет прав на удаление этого материала'},
            status=status.HTTP_403_FORBIDDEN
        )
    except StudentMaterial.DoesNotExist:
        return Response(
            {'error': 'Материал не найден'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error deleting material: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
