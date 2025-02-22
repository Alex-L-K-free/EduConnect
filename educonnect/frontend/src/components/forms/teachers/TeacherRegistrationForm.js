import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './TeacherRegistrationForm.css';

const TeacherRegistrationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    // email: '',
    firstName: '',
    lastName: '',
    // specialization: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Получаем токен из localStorage или другого хранилища
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/v1/teachers/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Добавляем токен для авторизации
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при регистрации учителя');
      }

      const newTeacher = await response.json();
      setSuccess('Учитель успешно зарегистрирован');
      
      // Очищаем форму
      setFormData({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
      });

      // Вызываем callback с новым учителем
      if (onSuccess) {
        onSuccess(newTeacher);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="teacher-registration-form">
      <h2>Регистрация нового учителя</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Логин</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group> */}

        <Form.Group className="mb-3">
          <Form.Label>Имя</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Фамилия</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* <Form.Group className="mb-3">
          <Form.Label>Специализация</Form.Label>
          <Form.Control
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
          />
        </Form.Group> */}

        <Button variant="primary" type="submit">
          Зарегистрировать учителя
        </Button>
      </Form>
    </div>
  );
};

export default TeacherRegistrationForm; 