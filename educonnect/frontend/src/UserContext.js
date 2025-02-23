import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Пытаемся получить данные пользователя из localStorage при инициализации
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    // При изменении user сохраняем в localStorage
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    // Проверяем валидность токена при загрузке
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        try {
          const response = await fetch('http://127.0.0.1:8000/api/v1/users/me/', {
            headers: {
              'Authorization': `Token ${userData.token}`
            }
          });
          
          if (!response.ok) {
            // Если токен недействителен, очищаем данные
            setUser(null);
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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