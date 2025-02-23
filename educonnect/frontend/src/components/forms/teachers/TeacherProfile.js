import React, { useState, useEffect } from 'react';
import { Form, Button, Card, ListGroup, Modal } from 'react-bootstrap';
import { useUser } from '../../../UserContext';
import './TeacherProfile.css';

const TeacherProfile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState({
    username: '',
    firstName: '',
    lastName: '',
    middleName: '',
    about: '',
    email: '',
    telegram: '',
    viber: '',
    subjects: []
  });
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newPassword, setNewPassword] = useState({ current: '', new: '', confirm: '' });
  const [newSubject, setNewSubject] = useState({ name: '', grade: '', code: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeacherProfile();
  }, [user]);

  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/teachers/profile/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/teachers/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setSuccess('Профиль успешно обновлен');
        setIsEditing(false);
      } else {
        setError('Ошибка при обновлении профиля');
      }
    } catch (error) {
      setError('Ошибка сервера');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.new !== newPassword.confirm) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/teachers/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          current_password: newPassword.current,
          new_password: newPassword.new
        })
      });

      if (response.ok) {
        setSuccess('Пароль успешно изменен');
        setShowPasswordModal(false);
        setNewPassword({ current: '', new: '', confirm: '' });
      } else {
        setError('Ошибка при изменении пароля');
      }
    } catch (error) {
      setError('Ошибка сервера');
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/teachers/subjects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSubject)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({
          ...prev,
          subjects: [...prev.subjects, data]
        }));
        setShowSubjectModal(false);
        setNewSubject({ name: '', grade: '', code: '' });
      }
    } catch (error) {
      setError('Ошибка при добавлении предмета');
    }
  };

  return (
    <div className="teacher-profile">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3>Профиль учителя</h3>
          <div>
            {!isEditing ? (
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                Редактировать
              </Button>
            ) : (
              <Button variant="success" onClick={handleProfileUpdate}>
                Сохранить
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Логин</Form.Label>
              <Form.Control
                type="text"
                value={profile.username}
                disabled
              />
            </Form.Group>

            <Button 
              variant="outline-primary" 
              onClick={() => setShowPasswordModal(true)}
              className="mb-3"
            >
              Изменить пароль
            </Button>

            <Form.Group className="mb-3">
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Отчество</Form.Label>
              <Form.Control
                type="text"
                value={profile.middleName}
                onChange={(e) => setProfile({...profile, middleName: e.target.value})}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Telegram</Form.Label>
              <Form.Control
                type="text"
                value={profile.telegram}
                onChange={(e) => setProfile({...profile, telegram: e.target.value})}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Viber</Form.Label>
              <Form.Control
                type="text"
                value={profile.viber}
                onChange={(e) => setProfile({...profile, viber: e.target.value})}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>О себе</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={profile.about}
                onChange={(e) => setProfile({...profile, about: e.target.value})}
                disabled={!isEditing}
              />
            </Form.Group>
          </Form>

          <div className="subjects-section mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Предметы</h4>
              <Button variant="success" onClick={() => setShowSubjectModal(true)}>
                Добавить предмет
              </Button>
            </div>
            <ListGroup>
              {profile.subjects.map((subject, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{subject.name}</strong> - {subject.grade} класс
                    <small className="text-muted ms-2">({subject.code})</small>
                  </div>
                  <Button variant="outline-danger" size="sm">Удалить</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Card.Body>
      </Card>

      {/* Модальное окно изменения пароля */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Изменение пароля</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordChange}>
            <Form.Group className="mb-3">
              <Form.Label>Текущий пароль</Form.Label>
              <Form.Control
                type="password"
                value={newPassword.current}
                onChange={(e) => setNewPassword({...newPassword, current: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Новый пароль</Form.Label>
              <Form.Control
                type="password"
                value={newPassword.new}
                onChange={(e) => setNewPassword({...newPassword, new: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Подтверждение пароля</Form.Label>
              <Form.Control
                type="password"
                value={newPassword.confirm}
                onChange={(e) => setNewPassword({...newPassword, confirm: e.target.value})}
                required
              />
            </Form.Group>
            <Button type="submit">Сохранить</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Модальное окно добавления предмета */}
      <Modal show={showSubjectModal} onHide={() => setShowSubjectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Добавление предмета</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubject}>
            <Form.Group className="mb-3">
              <Form.Label>Название предмета</Form.Label>
              <Form.Control
                type="text"
                value={newSubject.name}
                onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Класс</Form.Label>
              <Form.Control
                type="text"
                value={newSubject.grade}
                onChange={(e) => setNewSubject({...newSubject, grade: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Индекс класса</Form.Label>
              <Form.Control
                type="text"
                value={newSubject.code}
                onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                required
              />
            </Form.Group>
            <Button type="submit">Добавить</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TeacherProfile;
