import React, { useState, useEffect, useCallback } from 'react';
import { Card, ListGroup, Button, Form, Alert } from 'react-bootstrap';
import { useUser } from '../../../UserContext';
import './StudentsList.css';

const initialStudentState = {
    firstName: '',
    lastName: '',
    middleName: '',
    subject: '',
    grade: '',
    index: ''
};

const StudentsList = () => {
    const { user } = useUser();
    const [students, setStudents] = useState([]);
    const [newStudent, setNewStudent] = useState(initialStudentState);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState([]);
    const [indices, setIndices] = useState([]);
    const [teacherSubjects, setTeacherSubjects] = useState([]);

    // Получаем список предметов учителя
    const fetchTeacherSubjects = useCallback(async () => {
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
            // Преобразуем данные в нужный формат
            const subjectsData = data.map(subject => ({
                name: subject.name,
                grade: subject.grade,
                code: subject.code
            }));
            setTeacherSubjects(subjectsData);
        } catch (error) {
            console.error('Ошибка при загрузке предметов:', error);
        }
    }, [user]);

    // Получаем списки для выпадающих меню
    useEffect(() => {
        if (teacherSubjects.length > 0) {
            const uniqueSubjects = [...new Set(teacherSubjects.map(s => s.name))];
            const uniqueGrades = [...new Set(teacherSubjects.map(s => s.grade))];
            const uniqueIndices = [...new Set(teacherSubjects.map(s => s.code.split('-')[2]))]; // Получаем индекс из кода
            
            setSubjects(uniqueSubjects.filter(Boolean));
            setGrades(uniqueGrades.filter(Boolean));
            setIndices(uniqueIndices.filter(Boolean));
        }
    }, [teacherSubjects]);

    // Загружаем предметы при монтировании компонента
    useEffect(() => {
        if (user && user.token) {
            fetchTeacherSubjects();
        }
    }, [fetchTeacherSubjects, user]);

    // Загрузка списка учеников
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
                body: JSON.stringify(newStudent),
            });

            if (!response.ok) {
                throw new Error('Failed to add student');
            }

            const data = await response.json();
            setStudents([...students, data]);
            setNewStudent(initialStudentState);
            setIsAdding(false);
            setSuccess('Ученик успешно добавлен');
        } catch (error) {
            setError('Ошибка при добавлении ученика');
            console.error('Error:', error);
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

    return (
        <div className="students-list">
            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Мои ученики</h5>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => setIsAdding(true)}
                            disabled={isAdding}
                        >
                            Добавить ученика
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    
                    <ListGroup>
                        {isAdding && (
                            <ListGroup.Item>
                                <Form onSubmit={handleAddStudent} className="d-flex gap-2 align-items-end">
                                    <Form.Group className="mb-0 flex-grow-1">
                                        <Form.Select 
                                            value={newStudent.subject}
                                            onChange={(e) => setNewStudent({...newStudent, subject: e.target.value})}
                                            required
                                        >
                                            <option value="">Выберите предмет</option>
                                            {subjects.map(subject => (
                                                <option key={subject} value={subject}>{subject}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-0">
                                        <Form.Select 
                                            value={newStudent.grade}
                                            onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                                            required
                                        >
                                            <option value="">Класс</option>
                                            {grades.map(grade => (
                                                <option key={grade} value={grade}>{grade}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-0">
                                        <Form.Select 
                                            value={newStudent.index}
                                            onChange={(e) => setNewStudent({...newStudent, index: e.target.value})}
                                            required
                                        >
                                            <option value="">Индекс</option>
                                            {indices.map(index => (
                                                <option key={index} value={index}>{index}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-0 flex-grow-1">
                                        <Form.Control
                                            type="text"
                                            placeholder="Фамилия"
                                            value={newStudent.lastName}
                                            onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-0 flex-grow-1">
                                        <Form.Control
                                            type="text"
                                            placeholder="Имя"
                                            value={newStudent.firstName}
                                            onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-0 flex-grow-1">
                                        <Form.Control
                                            type="text"
                                            placeholder="Отчество"
                                            value={newStudent.middleName}
                                            onChange={(e) => setNewStudent({...newStudent, middleName: e.target.value})}
                                        />
                                    </Form.Group>

                                    <Button type="submit" variant="success" size="sm">
                                        Сохранить
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        size="sm"
                                        onClick={() => {
                                            setIsAdding(false);
                                            setNewStudent(initialStudentState);
                                        }}
                                    >
                                        Отмена
                                    </Button>
                                </Form>
                            </ListGroup.Item>
                        )}

                        {students.map((student) => (
                            <ListGroup.Item 
                                key={student.id}
                                className="d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <strong>{student.lastName} {student.firstName} {student.middleName}</strong>
                                    <br />
                                    <small className="text-muted">
                                        Предмет: {student.subject} | 
                                        Класс: {student.grade}{student.index} |
                                        {student.username ? ` Логин: ${student.username}` : ' Не зарегистрирован'}
                                    </small>
                                </div>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteStudent(student.id)}
                                >
                                    Удалить
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>
        </div>
    );
};

export default StudentsList;
