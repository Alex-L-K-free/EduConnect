import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, ListGroup, Modal } from 'react-bootstrap';
import { useUser } from '../../../UserContext';
import './TeacherProfile.css';

const TeacherProfile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    telegram: '',
    viber: '',
    about: '',
    specialization: '',
    subjects: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newPassword, setNewPassword] = useState({ current: '', new: '', confirm: '' });
  const [newSubject, setNewSubject] = useState({ name: '', grade: '', code: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editedProfile, setEditedProfile] = useState({});

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/teachers/profile/', {
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Полученные данные профиля:', data);
      setProfile(data);
      setEditedProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Ошибка при загрузке профиля');
    }
  }, [user]);

  useEffect(() => {
    if (user && user.token) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEditing) {
      return;
    }

    const updateData = {
      firstName: editedProfile.firstName,
      lastName: editedProfile.lastName,
      email: editedProfile.email || '',
      telegram: editedProfile.telegram || '',
      viber: editedProfile.viber || '',
      about: editedProfile.about || '',
      specialization: editedProfile.specialization || ''
    };

    console.log('Отправляемые данные:', updateData);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/teachers/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedProfile = await response.json();
      console.log('Полученные обновленные данные:', updatedProfile);
      
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Профиль успешно обновлен');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Ошибка при обновлении профиля');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccess('');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.new !== newPassword.confirm) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const response = await fetch('/api/v1/teachers/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`
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
      const response = await fetch('/api/v1/teachers/subjects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`
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
        <Card.Header>
          <h2>Профиль учителя</h2>
        </Card.Header>
        <Card.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Логин</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={profile.username}
                disabled
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={isEditing ? editedProfile.firstName : profile.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={isEditing ? editedProfile.lastName : profile.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={isEditing ? editedProfile.email : profile.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Telegram</Form.Label>
              <Form.Control
                type="text"
                name="telegram"
                value={isEditing ? editedProfile.telegram : profile.telegram}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Viber</Form.Label>
              <Form.Control
                type="text"
                name="viber"
                value={isEditing ? editedProfile.viber : profile.viber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>О себе</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="about"
                value={isEditing ? editedProfile.about : profile.about}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Специализация</Form.Label>
              <Form.Control
                type="text"
                name="specialization"
                value={isEditing ? editedProfile.specialization : profile.specialization}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <div className="d-flex justify-content-between mt-4">
              {!isEditing ? (
                <>
                  <Button 
                    variant="primary" 
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setSuccess('');
                      setError('');
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button 
                    variant="outline-primary"
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Изменить пароль
                  </Button>
                </>
              ) : (
                <div className="d-flex gap-2">
                  <Button 
                    variant="success" 
                    type="submit"
                  >
                    Сохранить
                  </Button>
                  <Button 
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setSuccess('');
                      setError('');
                      fetchProfile();
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              )}
            </div>
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
