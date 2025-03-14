from django.shortcuts import render
from rest_framework import viewsets, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from education_core.models import User
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework import status
from education_core.constants import ROLE_STUDENT
from django.contrib.auth import get_user_model
from users_student.models import StudentUser  # Добавьте этот импорт
from django.contrib.auth.hashers import check_password  # Добавляем импорт

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

class StudentLoginView(APIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        print(f"Login attempt for username: {username}")
        print(f"Received password: {password}")
        
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
            print(f"Stored password hash: {student.password}")
            
            # Используем check_password для проверки пароля
            if check_password(password, student.password):
                user, created = User.objects.get_or_create(
                    username=student.username,
                    defaults={
                        'first_name': student.firstName,
                        'last_name': student.lastName,
                        'role': ROLE_STUDENT
                    }
                )
                
                token, _ = Token.objects.get_or_create(user=user)
                print(f"Login successful for student: {student.username}")

                subjects = list(students.values_list('subject', flat=True).distinct())
                
                return Response({
                    'token': token.key,
                    'id': user.id,
                    'username': user.username,
                    'role': 'student',
                    'first_name': student.firstName,
                    'last_name': student.lastName,
                    'subjects': subjects,
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
