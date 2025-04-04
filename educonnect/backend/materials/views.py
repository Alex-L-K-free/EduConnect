from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from education_core.models import User
from users_student.models import StudentUser
from .models import StudentMaterial
from .serializers import StudentMaterialSerializer
import logging
import json
import os
from django.conf import settings
from django.utils import timezone
from api.views import StudentTokenAuthentication  # Добавляем импорт

logger = logging.getLogger(__name__)

@api_view(['POST'])
@authentication_classes([TokenAuthentication, StudentTokenAuthentication])
@permission_classes([IsAuthenticated])
def add_material(request):
    try:
        # Добавим логирование для отладки
        logger.info(f"Request user: {request.user}, Auth: {request.auth}")
        logger.info(f"Headers: {request.headers}")
        logger.info(f"Authorization header: {request.META.get('HTTP_AUTHORIZATION')}")

        if not request.auth:
            logger.error("No auth token provided")
            return Response(
                {'error': 'Требуется авторизация'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Проверяем, что пользователь - ученик
        student = None
        if isinstance(request.user, StudentUser):
            student = request.user
            logger.info(f"User is StudentUser: {student}")
        else:
            try:
                token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
                student = StudentUser.objects.get(auth_token=token)
                logger.info(f"Found student by token: {student}")
            except (IndexError, StudentUser.DoesNotExist) as e:
                logger.error(f"Error finding student: {str(e)}")
                return Response(
                    {'error': 'Ученик не найден'},
                    status=status.HTTP_404_NOT_FOUND
                )

        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'Файл не предоставлен'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создаем материал для ученика
        material = StudentMaterial(
            student=student,
            title=file.name,
            description=request.data.get('description', ''),
            file=file,
            material_type='document',
            created_by=request.user,
            created_at=timezone.now(),
            is_student_material=True
        )
        material.save()
        
        serializer = StudentMaterialSerializer(material, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Error uploading student material: {str(e)}")
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
            {'error': 'Ученик не найден'},
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
    try:
        student_ids = request.query_params.get('student_ids', '').split(',')
        student_ids = [int(id) for id in student_ids if id.isdigit()]
        
        if not student_ids:
            return Response(
                {'error': 'Не указаны ID учеников'},
                status=status.HTTP_400_BAD_REQUEST
            )

        materials = StudentMaterial.objects.filter(student_id__in=student_ids)
        
        # Группируем материалы по ученикам
        materials_by_student = {}
        for material in materials:
            if material.student_id not in materials_by_student:
                materials_by_student[material.student_id] = []
            materials_by_student[material.student_id].append(material)

        # Формируем ответ
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_delete_materials(request):
    if request.user.role != User.TEACHER:
        return Response(
            {'error': 'Только учителя могут удалять материалы'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        student_ids = request.data.get('student_ids', [])
        material_type = request.data.get('type', 'materials')

        # Удаляем соответствующие материалы для выбранных учеников
        if material_type == 'materials':
            materials = StudentMaterial.objects.filter(student_id__in=student_ids)
        elif material_type == 'tasks':
            materials = StudentMaterial.objects.filter(
                student_id__in=student_ids,
                material_type='document'
            )
        elif material_type == 'messages':
            materials = StudentMaterial.objects.filter(
                student_id__in=student_ids,
                material_type='message'
            )
        else:
            return Response(
                {'error': 'Неверный тип материала'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Удаляем файлы
        for material in materials:
            if material.file:
                file_path = os.path.join(settings.MEDIA_ROOT, material.file.name)
                if os.path.exists(file_path):
                    os.remove(file_path)

        # Удаляем записи из базы данных
        materials.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    except Exception as e:
        logger.error(f"Error bulk deleting materials: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@authentication_classes([StudentTokenAuthentication])
@permission_classes([IsAuthenticated])
def student_upload_material(request):
    try:
        student = request.user
        
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'Файл не предоставлен'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создаем материал с флагом is_student_material=True
        material = StudentMaterial(
            student=student,
            title=file.name,
            description=request.data.get('description', ''),
            file=file,
            material_type='document',
            created_by=student,
            created_at=timezone.now(),
            is_student_material=True  # Важно: устанавливаем флаг
        )
        material.save()
        
        serializer = StudentMaterialSerializer(material, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Error uploading student material: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@authentication_classes([StudentTokenAuthentication])
@permission_classes([IsAuthenticated])
def student_delete_material(request, material_id):
    try:
        # Получаем материал и проверяем, что он принадлежит текущему ученику
        material = StudentMaterial.objects.get(
            id=material_id,
            student=request.user,
            is_student_material=True  # Проверяем, что это материал ученика
        )
        
        # Удаляем файл
        if material.file:
            if os.path.exists(material.file.path):
                os.remove(material.file.path)
        
        # Удаляем запись из базы данных
        material.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    except StudentMaterial.DoesNotExist:
        return Response(
            {'error': 'Материал не найден или у вас нет прав на его удаление'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error deleting student material: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
