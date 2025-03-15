import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
// import axios from 'axios';
import { useUser } from '../UserContext'; // Импортируем контекст
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import './LoginModal.css'; // Импортируем стили
import StudentsRegistrationModal from './forms/students/StudentsRegistrationModal';

const LoginModal = ({ show, onHide }) => {
  const { login } = useUser(); // Используем login вместо setUser
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Получаем navigate для перенаправления
  const [showRegistration, setShowRegistration] = useState(false);

  const handleSuccessfulLogin = async (data, role) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', role);
    localStorage.setItem('username', data.username);
    
    // Получаем дополнительные данные только для учителей и администраторов
    if (role === 'teacher' || role === 'admin') {
      try {
        const userResponse = await fetch('http://127.0.0.1:8000/api/v1/users/me/', {
          headers: {
            'Authorization': `Token ${data.token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Объединяем данные авторизации с полными данными пользователя
          const fullUserData = {
            ...data,
            ...userData
          };
          login(fullUserData);
        } else {
          console.error('Failed to fetch user data');
          login(data); // Используем базовые данные в случае ошибки
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        login(data); // Используем базовые данные в случае ошибки
      }
    } else {
      // Для студентов используем данные, полученные при входе
      login(data);
    }

    onHide();

    switch (role) {
      case 'student':
        navigate('/student');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'teacher':
        navigate('/teacher');
        break;
      default:
        setError('Неизвестная роль пользователя');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Сначала пробуем войти как студент
    try {
      const studentResponse = await fetch('http://127.0.0.1:8000/api/v1/students/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (studentResponse.ok) {
        const data = await studentResponse.json();
        handleSuccessfulLogin(data, 'student');
        return;
      }

      // Если не удалось войти как студент, пробуем как учитель/админ
      const teacherResponse = await fetch('http://127.0.0.1:8000/api/v1/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (teacherResponse.ok) {
        const data = await teacherResponse.json();
        handleSuccessfulLogin(data, data.role);
        return;
      }

      // Если оба запроса неуспешны
      const errorData = await teacherResponse.json();
      throw new Error(errorData.error || 'Неверные учетные данные');

    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };

  const handleRegistrationClick = () => {
    setShowRegistration(true);
    onHide();
  };

  return (
    <>
      <Modal show={show} onHide={onHide} className="login-modal">
        <Modal.Header closeButton>
          <Modal.Title>Вход в систему</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Логин</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-between align-items-center">
              <Button variant="success" type="submit">
                Войти
              </Button>
              <Button 
                variant="outline-primary" 
                onClick={handleRegistrationClick}
                className="registration-btn"
              >
                Регистрация
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <StudentsRegistrationModal 
        show={showRegistration}
        onHide={() => setShowRegistration(false)}
      />
    </>
  );
};

export default LoginModal; 