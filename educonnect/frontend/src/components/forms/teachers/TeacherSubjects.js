import React, { useState, useEffect, useCallback } from 'react';
import { Card, ListGroup, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useUser } from '../../../UserContext';
import './TeacherSubjects.css';

const TeacherSubjects = () => {
  const { user } = useUser();
  const [subjects, setSubjects] = useState([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', grade: '', code: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/teachers/subjects/', {
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSubjects(data.subjects);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Ошибка при загрузке предметов');
    }
  }, [user.token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/teachers/subjects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`
        },
        body: JSON.stringify(newSubject)
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении предмета');
      }

      await fetchProfile();
      setShowSubjectModal(false);
      setNewSubject({ name: '', grade: '', code: '' });
      setSuccess('Предмет успешно добавлен');
    } catch (error) {
      setError('Ошибка при добавлении предмета');
    }
  };

  const handleRemoveSubject = async (subjectId) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/teachers/subjects/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`
        },
        body: JSON.stringify({ subject_id: subjectId })
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении предмета');
      }

      await fetchProfile();
      setSuccess('Предмет успешно удален');
    } catch (error) {
      setError('Ошибка при удалении предмета');
    }
  };

  return (
    <div className="teacher-subjects">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Мои предметы</h5>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setShowSubjectModal(true)}
          >
            Добавить предмет
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <ListGroup>
            {subjects.map((subject) => (
              <ListGroup.Item 
                key={subject.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{subject.name}</strong> - {subject.grade} класс
                  <br />
                  <small className="text-muted">Код: {subject.code}</small>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveSubject(subject.id)}
                >
                  Удалить
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

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

export default TeacherSubjects;
