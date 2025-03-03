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
