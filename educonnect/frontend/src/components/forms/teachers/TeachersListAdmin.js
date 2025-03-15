import React, { useState } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import './TeachersListAdmin.css';

const TeachersListAdmin = ({ teachers, onAddTeacher }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    middleName: '',
    specialization: '',
    about: ''
  });

  // Обработчик для открытия модального окна редактирования
  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher);
    setEditForm({
      username: teacher.username,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      middleName: teacher.middleName,
      specialization: teacher.specialization || '',
      about: teacher.about || ''
    });
    setShowEditModal(true);
  };

  // Обработчик для сохранения изменений
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/teachers/${selectedTeacher.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        // Обновляем список учителей
        window.location.reload();
        setShowEditModal(false);
      } else {
        console.error('Failed to update teacher');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
    }
  };

  // Обработчик для открытия модального окна удаления
  const handleDeleteClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  // Обработчик для подтверждения удаления
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/teachers/${selectedTeacher.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Обновляем список учителей
        window.location.reload();
        setShowDeleteModal(false);
      } else {
        console.error('Failed to delete teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

  return (
    <div className="teachers-list">
      <div className="teachers-header">
        <h2>Список учителей</h2>
        <Button 
          variant="primary" 
          onClick={onAddTeacher}
          className="add-teacher-btn"
        >
          Добавить учителя
        </Button>
      </div>
      
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Логин</th>
            <th>Фамилия</th>
            <th>Имя</th>
            <th>Отчество</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <td>{teacher.username}</td>
              <td>{teacher.lastName}</td>
              <td>{teacher.firstName}</td>
              <td>{teacher.middleName}</td>
              <td>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => handleEditClick(teacher)}
                >
                  Редактировать
                </Button>
                {' '}
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleDeleteClick(teacher)}
                >
                  Удалить
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Модальное окно редактирования */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать учителя</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Логин</Form.Label>
              <Form.Control
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Отчество</Form.Label>
              <Form.Control
                type="text"
                value={editForm.middleName}
                onChange={(e) => setEditForm({...editForm, middleName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Специализация</Form.Label>
              <Form.Control
                type="text"
                value={editForm.specialization}
                onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>О себе</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.about}
                onChange={(e) => setEditForm({...editForm, about: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение удаления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы действительно хотите удалить учителя {selectedTeacher?.lastName} {selectedTeacher?.firstName}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeachersListAdmin; 