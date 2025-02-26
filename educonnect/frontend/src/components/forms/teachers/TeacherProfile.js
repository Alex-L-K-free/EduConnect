import React, { useState, useEffect, useCallback } from 'react';
// import { Form, Button, Card, ListGroup, Modal } from 'react-bootstrap';
import { Form, Button, Card, Modal } from 'react-bootstrap';
import { useUser } from '../../../UserContext';
import './TeacherProfile.css';

const contactOptions = [
  { label: 'Телефон', value: 'phone' },
  { label: 'Email', value: 'email' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Viber', value: 'viber' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Skype', value: 'skype' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'YouTube', value: 'youtube' },
  
];

const TeacherProfile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState({
    username: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    school_name: '',
    // email: '',
    // telegram: '',
    // viber: '',
    about: '',
    contacts: {},
    // specialization: '',
    // subjects: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editedProfile, setEditedProfile] = useState({});

  const [editedContacts, setEditedContacts] = useState({});
  const [selectedContactType, setSelectedContactType] = useState('');

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
      setEditedContacts(data.contacts || {});
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

  const handleContactChange = (type, value) => {
    setEditedContacts(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleAddContact = () => {
    if (selectedContactType && !editedContacts[selectedContactType]) {
      setEditedContacts(prev => ({ ...prev, [selectedContactType]: '' }));
    }
    setSelectedContactType('');
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEditing) {
      return;
    }

    const updateData = {
      first_name: editedProfile.first_name,
      last_name: editedProfile.last_name,
      middle_name: editedProfile.middle_name,
      school_name: editedProfile.school_name,
      // email: editedProfile.email || '',
      // telegram: editedProfile.telegram || '',
      // viber: editedProfile.viber || '',
      about: editedProfile.about || '',
      contacts: editedContacts
      // specialization: editedProfile.specialization || ''
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
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={isEditing ? editedProfile.last_name : profile.last_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={isEditing ? editedProfile.first_name : profile.first_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Отчество</Form.Label>
              <Form.Control
                type="text"
                name="middle_name"
                value={isEditing ? editedProfile.middle_name : profile.middle_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Наименование школы</Form.Label>
              <Form.Control
                type="text"
                name="school_name"
                value={isEditing ? editedProfile.school_name : profile.school_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>О себе</Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                name="about"
                value={isEditing ? editedProfile.about : profile.about}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>
            
            {/* <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={isEditing ? editedProfile.email : profile.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group> */}

            {/* <Form.Group className="mb-3">
              <Form.Label>Telegram</Form.Label>
              <Form.Control
                type="text"
                name="telegram"
                value={isEditing ? editedProfile.telegram : profile.telegram}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group> */}

            {/* <Form.Group className="mb-3">
              <Form.Label>Viber</Form.Label>
              <Form.Control
                type="text"
                name="viber"
                value={isEditing ? editedProfile.viber : profile.viber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group> */}

            {/* <Form onSubmit={handleSubmit}> */}
            <Form.Group className="mb-3">
              <Form.Label>Контактные данные</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select 
                  value={selectedContactType} 
                  onChange={(e) => setSelectedContactType(e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="">Выберите контакт</option>
                  {contactOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Select>
                <Button onClick={handleAddContact} disabled={!isEditing || !selectedContactType}>Добавить</Button>
              </div>
              {Object.entries(editedContacts).map(([type, value]) => (
                <div key={type} className="d-flex gap-2 mt-2">
                  <Form.Label className="me-2">{contactOptions.find(opt => opt.value === type)?.label}:</Form.Label>
                  <Form.Control
                    type="text"
                    value={value}
                    onChange={(e) => handleContactChange(type, e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              ))}
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
    </div>
  );
};

export default TeacherProfile;
