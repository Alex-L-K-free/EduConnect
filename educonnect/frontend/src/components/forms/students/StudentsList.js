import React, { useState, useEffect, useCallback } from 'react';
import { Card, ListGroup, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useUser } from '../../../UserContext';
import './StudentsList.css';

const initialStudentState = {
    username: '',
    lastName: '',
    firstName: '',
    middleName: '',
    subject: '',
    grade: '',
    index: ''
};

const StudentsList = ({ mode = 'teacher' }) => {
  const { user } = useUser();
  const [students, setStudents] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState(initialStudentState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);

  const fetchStudents = useCallback(async () => {
    if (!user || !user.token) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/students/', {
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Ошибка при загрузке учеников');
      
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setError('Ошибка при загрузке учеников');
    }
  }, [user]);

  useEffect(() => {
    if (user && user.token) {
      fetchStudents();
    }
  }, [fetchStudents, user]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/students/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`,
        },
        body: JSON.stringify({
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          middleName: newStudent.middleName || '',
          grade: newStudent.grade,
          subject: newStudent.subject || '',
          index: newStudent.index
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add student');
      }

      const data = await response.json();
      setStudents([...students, data]);
      setShowStudentModal(false);
      setNewStudent(initialStudentState);
      setSuccess('Ученик успешно добавлен');
    } catch (error) {
      setError('Ошибка при добавлении ученика');
      console.error('Error:', error);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/students/${editingStudent.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newStudent)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при редактировании ученика');
      }

      setShowStudentModal(false);
      setEditingStudent(null);
      setNewStudent(initialStudentState);
      setSuccess('Данные ученика успешно обновлены');
      fetchStudents();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого ученика?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/students/${studentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении ученика');
      }

      setSuccess('Ученик успешно удален');
      fetchStudents();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setNewStudent({
      username: student.username,
      lastName: student.lastName,
      firstName: student.firstName,
      middleName: student.middleName,
      subject: student.subject,
      grade: student.grade,
      index: student.index,
    });
    setShowStudentModal(true);
  };

  const handleCloseModal = () => {
    setShowStudentModal(false);
    setEditingStudent(null);
    setNewStudent(initialStudentState);
  };

  return (
    <div className="students-list">
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Мои ученики</h5>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setShowStudentModal(true)}
            >
              Добавить ученика
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <ListGroup>
            {students.map((student) => (
              <ListGroup.Item 
                key={student.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{student.lastName} {student.firstName} {student.middleName}</strong>
                  <br />
                  <small className="text-muted">
                    Предмет: {student.subject}
                    Класс: {student.grade} {student.index}
                  </small>
                </div>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditClick(student)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteStudent(student.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      <Modal show={showStudentModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingStudent ? 'Редактирование ученика' : 'Добавление ученика'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={editingStudent ? handleEditStudent : handleAddStudent}>
            <Form.Group className="mb-3">
              <Form.Label>Логин</Form.Label>
              <Form.Control
                type="text"
                value={newStudent.username}
                onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                value={newStudent.lastName}
                onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                value={newStudent.firstName}
                onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Отчество</Form.Label>
              <Form.Control
                type="text"
                value={newStudent.middleName}
                onChange={(e) => setNewStudent({...newStudent, middleName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Предмет</Form.Label>
              <Form.Control
                type="text"
                value={newStudent.subject}
                onChange={(e) => setNewStudent({...newStudent, subject: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Класс</Form.Label>
              <Form.Control
                type="text"
                value={newStudent.grade}
                onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Индекс класса</Form.Label>
              <Form.Control
                type="text"
                value={newStudent.index}
                onChange={(e) => setNewStudent({...newStudent, index: e.target.value})}
                required
              />
            </Form.Group>
            <Button type="submit">
              {editingStudent ? 'Сохранить' : 'Добавить'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentsList;
