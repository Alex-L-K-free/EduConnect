import React, { useState, useEffect, useCallback } from 'react';
import { Card, ListGroup, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useUser } from '../../../UserContext';
import './SubjectsList.css';

const SubjectsList = ({ mode = 'teacher' }) => {
  const { user } = useUser();
  const [subjects, setSubjects] = useState([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ 
    name: '', 
    grade: '', 
    code: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);

  const fetchSubjects = useCallback(async () => {
    if (!user || !user.token) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/subjects/', {
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Ошибка при загрузке предметов');
      
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      setError('Ошибка при загрузке предметов');
    }
  }, [user]);

  useEffect(() => {
    if (user && user.token) {
      fetchSubjects();
    }
  }, [fetchSubjects, user]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/subjects/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSubject)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при добавлении предмета');
      }

      setShowSubjectModal(false);
      setNewSubject({ name: '', grade: '', code: '' });
      setSuccess('Предмет успешно добавлен');
      fetchSubjects();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/subjects/${editingSubject.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSubject)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при редактировании предмета');
      }

      setShowSubjectModal(false);
      setEditingSubject(null);
      setNewSubject({ name: '', grade: '', code: '' });
      setSuccess('Предмет успешно обновлен');
      fetchSubjects();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот предмет?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/subjects/${subjectId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении предмета');
      }

      setSuccess('Предмет успешно удален');
      fetchSubjects();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditClick = (subject) => {
    setEditingSubject(subject);
    setNewSubject({
      name: subject.name,
      grade: subject.grade,
      code: subject.code
    });
    setShowSubjectModal(true);
  };

  const handleEnroll = async (subjectId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/subjects/${subjectId}/enroll/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Ошибка при записи на предмет');

      setSuccess('Вы успешно записались на предмет');
      fetchSubjects();
    } catch (error) {
      setError('Ошибка при записи на предмет');
    }
  };

  return (
    <div className="subjects-list">
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {mode === 'teacher' ? 'Мои предметы' : 'Доступные предметы'}
            </h5>
            {mode === 'teacher' && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setShowSubjectModal(true)}
              >
                Добавить предмет
              </Button>
            )}
          </div>
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
                  <small className="text-muted">
                    Код: {subject.code}
                    {subject.teacher_name && ` | Учитель: ${subject.teacher_name}`}
                  </small>
                </div>
                <div>
                  {mode === 'teacher' && (
                    <>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditClick(subject)}
                      >
                        Редактировать
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteSubject(subject.id)}
                      >
                        Удалить
                      </Button>
                    </>
                  )}
                  {mode === 'student' && !subject.is_enrolled && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEnroll(subject.id)}
                    >
                      Записаться
                    </Button>
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      <Modal show={showSubjectModal} onHide={() => {
        setShowSubjectModal(false);
        setEditingSubject(null);
        setNewSubject({ name: '', grade: '', code: '' });
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSubject ? 'Редактирование предмета' : 'Добавление предмета'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={editingSubject ? handleEditSubject : handleAddSubject}>
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
            <Button type="submit">
              {editingSubject ? 'Сохранить' : 'Добавить'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SubjectsList;
