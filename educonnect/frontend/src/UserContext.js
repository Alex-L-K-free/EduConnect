import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const username = localStorage.getItem('username');

      if (token && role && username) {
        if (role === 'teacher') {
          try {
            // Получаем базовые данные учителя
            const userResponse = await fetch('http://127.0.0.1:8000/api/v1/users/me/', {
              headers: {
                'Authorization': `Token ${token}`
              }
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();

              // Получаем профиль учителя
              const teacherResponse = await fetch('http://127.0.0.1:8000/api/v1/teachers/profile/', {
                headers: {
                  'Authorization': `Token ${token}`
                }
              });

              if (teacherResponse.ok) {
                const teacherData = await teacherResponse.json();

                // Получаем предметы учителя
                const subjectsResponse = await fetch('http://127.0.0.1:8000/api/v1/subjects/', {
                  headers: {
                    'Authorization': `Token ${token}`
                  }
                });

                const subjectsData = await subjectsResponse.json();

                // Объединяем все данные учителя
                setUser({
                  ...userData,
                  ...teacherData,
                  subjects: subjectsData,
                  token: token,
                  role: role
                });
              }
            }
          } catch (error) {
            console.error('Error loading teacher data:', error);
          }
        } else if (role === 'student') {
          // Оставляем существующую логику для студентов без изменений
          try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/students/login/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                username,
                password: localStorage.getItem('password')
              })
            });

            if (response.ok) {
              const data = await response.json();
              setUser({
                username: data.username,
                role: 'student',
                first_name: data.first_name,
                last_name: data.last_name,
                subjects: data.subjects,
                grade: data.grade,
                teachers: data.teachers
              });
            }
          } catch (error) {
            console.error('Error loading student data:', error);
          }
        } else {
          // Для админа и других ролей
          try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/users/me/', {
              headers: {
                'Authorization': `Token ${token}`
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              setUser({
                ...userData,
                token: token,
                role: role
              });
            }
          } catch (error) {
            console.error('Error loading user data:', error);
          }
        }
      }
    };

    loadUserData();
  }, []);

  const login = (userData) => {
    setUser(userData);
    if (userData.password) {
      localStorage.setItem('password', userData.password);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
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