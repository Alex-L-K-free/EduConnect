import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useUser } from '../UserContext'; // Импортируем контекст
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import './LoginModal.css'; // Импортируем стили

const LoginModal = ({ show, handleClose }) => {
  const { setUser } = useUser(); // Получаем функцию для установки пользователя
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Получаем navigate для перенаправления

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
        // Сохраняем токен и роль в localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username);
        handleClose();

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

  return (
    <Modal show={show} onHide={handleClose} className="login-modal">
      <Modal.Header closeButton>
        <Modal.Title>Вход</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formBasicUsername">
            <Form.Label>Логин</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введите логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button variant="success" type="submit">
            Войти
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal; 