import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useUser } from '../UserContext'; // Импортируем контекст
import './LoginModal.css'; // Импортируем стили

const LoginModal = ({ show, handleClose }) => {
  const { setUser } = useUser(); // Получаем функцию для установки пользователя
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/v1/login/', {
        username,
        password,
      });
      console.log('Login successful:', response.data);
      setUser({ username: response.data.username }); // Сохраняем пользователя
      handleClose();
    } catch (err) {
      setError('Неверные учетные данные');
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