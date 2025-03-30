import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Инициализируем состояние из localStorage
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    const savedUsername = localStorage.getItem('username');
    
    if (savedToken && savedRole && savedUsername) {
      // Устанавливаем заголовок авторизации сразу при инициализации
      axios.defaults.headers.common['Authorization'] = `Token ${savedToken}`;
      
      return {
        token: savedToken,
        role: savedRole,
        username: savedUsername,
        isInitialized: false // Добавляем флаг инициализации
      };
    }
    return null;
  });

  const loadUserData = useCallback(async (token, role, username) => {
    if (!token || !role || !username) return;
    
    try {
      if (role === 'teacher') {
        const userResponse = await fetch('http://127.0.0.1:8000/api/v1/users/me/', {
          headers: { 'Authorization': `Token ${token}` }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const teacherResponse = await fetch('http://127.0.0.1:8000/api/v1/teachers/profile/', {
            headers: { 'Authorization': `Token ${token}` }
          });

          if (teacherResponse.ok) {
            const teacherData = await teacherResponse.json();
            const subjectsResponse = await fetch('http://127.0.0.1:8000/api/v1/subjects/', {
              headers: { 'Authorization': `Token ${token}` }
            });

            const subjectsData = await subjectsResponse.json();

            setUser(prev => ({
              ...prev,
              ...userData,
              ...teacherData,
              subjects: subjectsData,
              isInitialized: true
            }));
          }
        }
      } else if (role === 'student') {
        const response = await axios.get('http://127.0.0.1:8000/api/v1/students/profile/');
        
        if (response.status === 200) {
          setUser(prev => ({
            ...prev,
            ...response.data,
            isInitialized: true
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  useEffect(() => {
    if (user?.token && !user.isInitialized) {
      loadUserData(user.token, user.role, user.username);
    }
  }, [loadUserData, user?.token, user?.isInitialized, user?.role, user?.username]);

  const login = (userData) => {
    const dataToSave = {
      ...userData,
      token: userData.token,
      role: userData.role,
      username: userData.username,
      isInitialized: false // Сбрасываем флаг при логине
    };

    // Сохраняем в localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('username', userData.username);

    // Устанавливаем заголовок авторизации
    axios.defaults.headers.common['Authorization'] = `Token ${userData.token}`;

    setUser(dataToSave);
  };

  const logout = () => {
    // Очищаем localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    
    // Удаляем заголовок авторизации
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 