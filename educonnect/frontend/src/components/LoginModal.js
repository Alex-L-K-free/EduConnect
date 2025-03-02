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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        // Сохраняем токен и данные пользователя
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username);
        
        // Обновляем состояние пользователя в контексте
        login(data);
        
        onHide();

        // Перенаправление в зависимости от роли
        switch (data.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'teacher':
            navigate('/teacher');
            break;
          case 'student':
            navigate('/student');
            break;
          default:
            setError('Неизвестная роль пользователя');
        }
      } else {
        setError(data.error || 'Ошибка при входе');
      }
    } catch (err) {
      setError('Ошибка сервера');
      console.error('Login error:', err);
    }
  };

  const handleRegistrationClick = () => {
    onHide();
    setShowRegistration(true);
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
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Логин</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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