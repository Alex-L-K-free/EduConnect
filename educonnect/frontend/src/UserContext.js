import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Пытаемся получить данные пользователя из localStorage при инициализации
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true); // Состояние загрузки

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
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://127.0.0.1:8000/api/v1/users/me/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log('User data loaded:', data); // Логируем загруженные данные
        setUser({
          ...data,
          token: token
        });
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false); // Устанавливаем состояние загрузки в false
      });
    } else {
      setLoading(false); // Если токена нет, также устанавливаем состояние загрузки в false
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Сохраняем пользователя в localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
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