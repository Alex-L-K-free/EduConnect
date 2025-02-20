from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from education_core.models import User
from .serializers import UserSerializer

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
