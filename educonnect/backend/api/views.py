from django.shortcuts import render
from rest_framework import viewsets, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from education_core.models import User
from .serializers import UserSerializer, StudentProfileSerializer  # Добавляем импорт
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework import status
from education_core.constants import ROLE_STUDENT
from django.contrib.auth import get_user_model
from users_student.models import StudentUser  # Добавьте этот импорт
from materials.models import Material, StudentMaterial  # Импортируем модели материалов
from django.contrib.auth.hashers import check_password  # Добавляем импорт
import uuid
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.core.cache import cache
from rest_framework.permissions import BasePermission
from django.db.models import Count

User = get_user_model()

# Create your views here.

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint для просмотра пользователей.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Получить информацию о текущем пользователе
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            token = Token.objects.get_or_create(user=user)[0]
            return Response({
                'token': token.key,
                'username': user.username,
                'role': user.role
            })
        return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Получение информации о текущем пользователе
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class StudentTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Token '):
            return None
            
        try:
            token = auth_header.split(' ')[1]
            student = cache.get(f'student_token_{token}')
            if not student:
                student = StudentUser.objects.get(auth_token=token)
                cache.set(f'student_token_{token}', student, 86400)
            return (student, None)
        except (IndexError, StudentUser.DoesNotExist):
            return None

class IsAuthenticatedStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and hasattr(request.user, 'username'))

class StudentLoginView(APIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        print(f"Login attempt for username: {username}")
        
        try:
            students = StudentUser.objects.filter(username=username)
            
            if not students.exists():
                print(f"Student not found: {username}")
                return Response(
                    {"error": "Пользователь не найден"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            student = students.first()
            print(f"Student found: {student.username}")
            
            # Проверяем пароль
            if check_password(password, student.password):
                # Генерируем простой токен на основе username
                token = uuid.uuid4().hex
                student.auth_token = token  # сохраняем токен
                student.save()
                cache.set(f'student_token_{token}', student, 86400)
                
                print(f"Login successful for student: {student.username}")

                # Получаем все предметы студента
                all_subjects = student.get_subjects()
                subject_names = [s.name for s in all_subjects if s]
                
                return Response({
                    'token': token,
                    'username': student.username,
                    'role': 'student',
                    'first_name': student.firstName,
                    'last_name': student.lastName,
                    'subjects': subject_names,
                    'grade': student.grade,
                    'teachers': list(students.values_list('teacher__username', flat=True).distinct())
                })
            else:
                print(f"Invalid password for student: {student.username}")
                return Response(
                    {"error": "Неверный пароль"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        except Exception as e:
            print(f"Error during login: {str(e)}")
            return Response(
                {"error": "Ошибка при входе"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StudentProfileView(APIView):
    authentication_classes = [StudentTokenAuthentication]
    permission_classes = [IsAuthenticatedStudent]
    
    def get_student(self, request):
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Token '):
                token = auth_header.split(' ')[1]
                return StudentUser.objects.select_related(
                    'teacher',
                    'teacher__teacher_profile',
                    'teacher__teacher_profile__user'
                ).get(auth_token=token)
            return None
        except (StudentUser.DoesNotExist, IndexError):
            return None
    
    def get(self, request):
        student = self.get_student(request)
        if not student:
            return Response(
                {"error": "Профиль ученика не найден"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        print(f"Student: {student.username}")
        print(f"Student subjects: {student.subject}")
            
        serializer = StudentProfileSerializer(student)
        return Response(serializer.data)
    
    def put(self, request):
        student = self.get_student(request)
        if not student:
            return Response(
                {"error": "Профиль ученика не найден"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = StudentProfileSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_platform_stats(request):
    """
    Получение статистики по платформе: количество учеников и учебных материалов
    """
    # Получаем количество учеников
    students_count = StudentUser.objects.count()
    
    # Получаем количество учебных материалов
    materials_count = Material.objects.count() + StudentMaterial.objects.count()
    
    return Response({
        'students_count': students_count,
        'materials_count': materials_count
    })
