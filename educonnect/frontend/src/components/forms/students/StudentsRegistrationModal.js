import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './StudentsRegistrationModal.css';

const StudentsRegistrationModal = ({ show, onHide }) => {
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

      if (response.ok) {
        if (data.exists) {
          setIsVerified(true);
          setError('');
        } else {
          setIsVerified(false);
          setError('Ученик с такими данными не найден в списке класса');
        }
      } else {
        setError(data.error || 'Ошибка при проверке данных');
      }
    } catch (err) {
      setError('Ошибка сервера при проверке данных');
      console.error('Verification error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Проверяем верификацию
    if (!isVerified) {
      setError('Необходимо проверить данные ученика');
      return;
    }

    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const requestData = {
        username: formData.username,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        middle_name: formData.middleName || '',
        role: 'student'
      };

      const response = await fetch('http://127.0.0.1:8000/api/v1/students/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        onHide();
        navigate('/login');
      } else {
        setError(data.error || 'Ошибка при регистрации');
      }
    } catch (err) {
      setError('Ошибка сервера');
      console.error('Registration error:', err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} className="registration-modal">
      <Modal.Header closeButton>
        <Modal.Title>Регистрация ученика</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {isVerified && <Alert variant="success">Данные ученика подтверждены</Alert>}
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

          <Button 
            variant="info" 
            type="button" 
            onClick={verifyStudent}
            className="mb-3 w-100"
          >
            Проверить данные
          </Button>

          {isVerified && (
            <>
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
                />
              </Form.Group>
            </>
          )}

          <div className="d-flex justify-content-between align-items-center">
            <Button variant="success" type="submit" disabled={!isVerified}>
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
