import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './StudentsRegistrationModal.css';
import axios from 'axios';

const StudentsRegistrationModal = ({ show, onHide, onStudentUpdate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    lastName: '',
    firstName: '',
    middleName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Настраиваем базовый URL для axios
  axios.defaults.baseURL = 'http://127.0.0.1:8000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Сбрасываем верификацию при изменении ФИО
    if (['lastName', 'firstName', 'middleName'].includes(name)) {
      setIsVerified(false);
    }
  };

  // Функция проверки ученика по списку
  const verifyStudent = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/students/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastName: formData.lastName,
          firstName: formData.firstName,
          middleName: formData.middleName || ''
        })
      });

      const data = await response.json();
      return data.exists;

    } catch (err) {
      console.error('Verification error:', err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage({ text: '', type: '' });

    // Проверяем пароли
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      // Выполняем автоматическую проверку
      const isStudentVerified = await verifyStudent();
      
      if (!isStudentVerified) {
        setError('Ученик с такими данными не найден в списке класса');
        return;
      }

      // Если проверка прошла успешно, продолжаем регистрацию
      const response = await fetch('http://127.0.0.1:8000/api/v1/students/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          middle_name: formData.middleName || '',
          role: 'student'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Регистрация успешно завершена', type: 'success' });
        if (onStudentUpdate) onStudentUpdate();
        setTimeout(() => {
          onHide();
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'Ошибка при регистрации');
      }
    } catch (err) {
      setError('Ошибка сервера при регистрации');
      console.error('Registration error:', err);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Регистрация ученика</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {message.text && <Alert variant={message.type}>{message.text}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formLastName">
            <Form.Label>Фамилия</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Введите фамилию"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formFirstName">
            <Form.Label>Имя</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Введите имя"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formMiddleName">
            <Form.Label>Отчество</Form.Label>
            <Form.Control
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Введите отчество (необязательно)"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Логин</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите логин"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              required
              autoComplete="new-password"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label>Подтверждение пароля</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Подтвердите пароль"
              required
              autoComplete="new-password"
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center">
            <Button variant="success" type="submit">
              Зарегистрироваться
            </Button>
            <Button variant="outline-secondary" onClick={onHide}>
              Отмена
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default StudentsRegistrationModal;
