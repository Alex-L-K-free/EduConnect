import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, ListGroup, Button, Form, Alert, Modal } from 'react-bootstrap';
import { useUser } from '../../../UserContext';
import * as XLSX from 'xlsx';
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
    const [editingStudent, setEditingStudent] = useState(null);
    const fileInputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCriteria, setFilterCriteria] = useState({
        name: '',
        subject: '',
        grade: '',
        index: ''
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    console.log('Current user:', user);

    if (user) {
        console.log('User ID:', user.id); // Логируем ID пользователя
    } else {
        console.log('User is not logged in or not initialized');
    }

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

    // Добавляем useEffect для автоматического скрытия уведомлений
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess('');
            }, 3000); // Уведомление исчезнет через 3 секунды
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 3000); // Уведомление об ошибке исчезнет через 3 секунды
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleStartEdit = (student) => {
        console.log('Starting edit for student:', student);
        setEditingStudent(student.id);
        setNewStudent({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            middleName: student.middleName || '',
            subject: student.subject || '',
            grade: student.grade || '',
            index: student.index || ''
        });
        setIsAdding(true);
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            let url = 'http://127.0.0.1:8000/api/v1/students/';
            let method = 'POST';

            if (editingStudent) {
                url += `${editingStudent}/`;
                method = 'PUT';
            }

            const studentData = {
                firstName: newStudent.firstName,
                lastName: newStudent.lastName,
                middleName: newStudent.middleName || '',
                subject: newStudent.subject,
                grade: newStudent.grade,
                index: newStudent.index,
                teacher: user.id
            };

            console.log('Current user ID:', user.id);
            console.log('Sending data:', studentData);
            console.log('To URL:', url);
            console.log('Method:', method);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${user.token}`,
                },
                body: JSON.stringify(studentData),
            });

            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                console.error('Server error:', data);
                throw new Error(editingStudent ? 'Failed to update student' : 'Failed to add student');
            }

            if (editingStudent) {
                setStudents(prevStudents => {
                    const updated = prevStudents.map(student => {
                        if (student.id === editingStudent) {
                            console.log('Updating student:', student.id);
                            console.log('Old data:', student);
                            console.log('New data:', data);
                            return { ...student, ...data };
                        }
                        return student;
                    });
                    console.log('Updated students list:', updated);
                    return updated;
                });
                setSuccess('Данные ученика успешно обновлены');
            } else {
                setStudents(prevStudents => [...prevStudents, data]);
                setSuccess('Ученик успешно добавлен');
            }
            
            setNewStudent(initialStudentState);
            setIsAdding(false);
            setEditingStudent(null);
        } catch (error) {
            setError(editingStudent ? 'Ошибка при обновлении ученика' : 'Ошибка при добавлении ученика');
            console.error('Error:', error);
        }
    };

    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        setSelectedStudents(checked ? filteredStudents.map(s => s.id) : []);
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prev => {
            const newSelection = prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId];
            setSelectAll(newSelection.length === filteredStudents.length);
            return newSelection;
        });
    };

    const handleBulkDelete = () => {
        if (selectedStudents.length === 0) return;
        
        const studentsToDelete = students.filter(s => selectedStudents.includes(s.id));
        const names = studentsToDelete.map(s => `${s.lastName} ${s.firstName}`).join(', ');
        
        setStudentToDelete({ bulk: true, names, ids: selectedStudents });
        setShowConfirmModal(true);
    };

    const handleDeleteStudent = async (studentId) => {
        try {
            if (Array.isArray(studentId)) {
                // Массовое удаление
                await Promise.all(studentId.map(id =>
                    fetch(`http://127.0.0.1:8000/api/v1/students/${id}/`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Token ${user.token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                ));
                setSuccess('Выбранные ученики успешно удалены');
            } else {
                // Удаление одного ученика
                const response = await fetch(`http://127.0.0.1:8000/api/v1/students/${studentId}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Token ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error('Ошибка при удалении ученика');
                setSuccess('Ученик успешно удален');
            }
            
            fetchStudents();
            setShowConfirmModal(false);
            setStudentToDelete(null);
            setSelectedStudents([]);
            setSelectAll(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Проверяем, что выбраны предмет, класс и индекс
        if (!newStudent.subject || !newStudent.grade || !newStudent.index) {
            setError('Пожалуйста, выберите предмет, класс и индекс класса');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                console.log('Прочитанные данные:', jsonData);

                if (jsonData.length === 0) {
                    setError('Файл пуст или имеет неверный формат');
                    return;
                }

                // Находим правильные имена столбцов
                const firstRow = jsonData[0];
                const lastNameKey = Object.keys(firstRow).find(key => key.trim() === 'Фамилия');
                const firstNameKey = Object.keys(firstRow).find(key => key.trim() === 'Имя');
                const middleNameKey = Object.keys(firstRow).find(key => key.trim() === 'Отчество');

                if (!lastNameKey || !firstNameKey) {
                    setError('Файл должен содержать столбцы "Фамилия" и "Имя"');
                    return;
                }

                // Добавляем всех студентов из файла
                Promise.all(jsonData.map(row => {
                    const studentData = {
                        firstName: row[firstNameKey].toString().trim(),
                        lastName: row[lastNameKey].toString().trim(),
                        middleName: middleNameKey && row[middleNameKey] ? row[middleNameKey].toString().trim() : '',
                        subject: newStudent.subject,
                        grade: newStudent.grade,
                        index: newStudent.index,
                        teacher: user.id
                    };

                    console.log('Отправляем данные студента:', studentData);

                    return fetch('http://127.0.0.1:8000/api/v1/students/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${user.token}`,
                        },
                        body: JSON.stringify(studentData)
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(data => {
                                throw new Error(JSON.stringify(data));
                            });
                        }
                        return response.json();
                    });
                }))
                .then(results => {
                    console.log('Результаты добавления:', results);
                    setStudents(prev => [...prev, ...results]);
                    setSuccess(`Успешно добавлено ${results.length} учеников`);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    setNewStudent(initialStudentState); // Сбрасываем форму
                    setIsAdding(false); // Закрываем форму добавления
                })
                .catch(error => {
                    console.error('Ошибка при импорте:', error);
                    try {
                        const errorData = JSON.parse(error.message);
                        setError(Object.values(errorData).flat().join(', '));
                    } catch {
                        setError('Ошибка при импорте учеников');
                    }
                });

            } catch (error) {
                console.error('Ошибка при чтении файла:', error);
                setError('Ошибка при чтении файла');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Функция фильтрации студентов
    const filteredStudents = students.filter(student => {
        const fullName = `${student.lastName} ${student.firstName} ${student.middleName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' || 
            fullName.includes(searchLower) ||
            student.subject.toLowerCase().includes(searchLower) ||
            `${student.grade}${student.index}`.toLowerCase().includes(searchLower);

        const matchesFilters = 
            (filterCriteria.name === '' || 
                fullName.includes(filterCriteria.name.toLowerCase())) &&
            (filterCriteria.subject === '' || 
                student.subject.toLowerCase().includes(filterCriteria.subject.toLowerCase())) &&
            (filterCriteria.grade === '' || 
                student.grade.includes(filterCriteria.grade)) &&
            (filterCriteria.index === '' || 
                student.index.toLowerCase().includes(filterCriteria.index.toLowerCase()));

        return matchesSearch && matchesFilters;
    }).sort((a, b) => a.lastName.localeCompare(b.lastName));

    // Добавляем функции подсчета
    const getUniqueStudentsCount = (students) => {
        const uniqueNames = new Set(
            students.map(s => `${s.lastName} ${s.firstName} ${s.middleName}`.trim())
        );
        return uniqueNames.size;
    };

    const getUniqueSubjectsCount = (students) => {
        return new Set(students.map(s => s.subject)).size;
    };

    const getUniqueClassesCount = (students) => {
        return new Set(students.map(s => `${s.grade}${s.index}`)).size;
    };

    // Обновляем функцию генерации кода ученика с проверкой на наличие user
    const generateStudentCode = (student) => {
        // Проверяем наличие user и его свойств
        if (!user || !user.lastName || !user.firstName || !user.middleName) {
            return (
                <div className="student-code">
                    <span className="code-label">Код: </span>
                    <span className="code-value">
                        {`${student.subject}-${student.grade}-${student.index}`}
                    </span>
                </div>
            );
        }

        // Получаем код предмета и информацию об учителе из teacherSubjects
        const subjectInfo = teacherSubjects.find(
            s => s.name === student.subject && 
                s.grade === student.grade
        );

        return (
            <div className="student-code">
                <span className="code-label">Код: </span>
                <span className="code-value">
                    {subjectInfo ? subjectInfo.code : `${student.subject}-${student.grade}-${student.index}`}
                </span>
                <span className="code-separator"> | </span>
                <span className="teacher-label">Учитель: </span>
                <span className="teacher-value">
                    {user.lastName} {user.firstName} {user.middleName}
                </span>
            </div>
        );
    };

    return (
        <div className="students-list">
            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Мои ученики</h5>
                        {!isAdding && (
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => setIsAdding(true)}
                            >
                                Добавить ученика
                            </Button>
                        )}
                    </div>
                </Card.Header>

                {/* Уведомления */}
                <div className="notifications">
                    {error && <Alert variant="danger" className="fade-alert">{error}</Alert>}
                    {success && <Alert variant="success" className="fade-alert">{success}</Alert>}
                </div>

                {/* Фиксированная панель добавления */}
                <div className={`fixed-add-panel ${isAdding ? 'visible' : ''}`}>
                    {isAdding && (
                        <Form onSubmit={handleAddStudent} className="d-flex gap-2 align-items-end">
                            <Form.Group className="mb-0 flex-grow-1">
                                <Form.Select 
                                    value={newStudent.subject}
                                    onChange={(e) => setNewStudent({...newStudent, subject: e.target.value})}
                                    required={!fileInputRef.current?.files?.length}
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
                                    required={!fileInputRef.current?.files?.length}
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
                                    required={!fileInputRef.current?.files?.length}
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
                                    required={!fileInputRef.current?.files?.length}
                                />
                            </Form.Group>

                            <Form.Group className="mb-0 flex-grow-1">
                                <Form.Control
                                    type="text"
                                    placeholder="Имя"
                                    value={newStudent.firstName}
                                    onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                                    required={!fileInputRef.current?.files?.length}
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

                            <Form.Group className="mb-0">
                                <Form.Control
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileUpload}
                                    ref={fileInputRef}
                                    style={{ width: 'auto' }}
                                />
                            </Form.Group>

                            <Button type="submit" variant="success" size="sm">
                                {editingStudent ? 'Сохранить изменения' : 'Сохранить'}
                            </Button>
                            <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewStudent(initialStudentState);
                                    setEditingStudent(null);
                                }}
                            >
                                Отмена
                            </Button>
                        </Form>
                    )}
                </div>

                {/* Фиксированная панель поиска и фильтров */}
                <div className="fixed-search-panel">
                    <Form className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Быстрый поиск..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-3"
                        />
                        
                        <div className="filter-grid">
                            <Form.Control
                                type="text"
                                placeholder="Поиск по ФИО"
                                value={filterCriteria.name}
                                onChange={(e) => setFilterCriteria({
                                    ...filterCriteria,
                                    name: e.target.value
                                })}
                            />
                            <Form.Control
                                type="text"
                                placeholder="Предмет"
                                value={filterCriteria.subject}
                                onChange={(e) => setFilterCriteria({
                                    ...filterCriteria,
                                    subject: e.target.value
                                })}
                            />
                            <Form.Control
                                type="text"
                                placeholder="Класс"
                                value={filterCriteria.grade}
                                onChange={(e) => setFilterCriteria({
                                    ...filterCriteria,
                                    grade: e.target.value
                                })}
                            />
                            <Form.Control
                                type="text"
                                placeholder="Индекс"
                                value={filterCriteria.index}
                                onChange={(e) => setFilterCriteria({
                                    ...filterCriteria,
                                    index: e.target.value
                                })}
                            />
                        </div>
                    </Form>
                </div>

                <Card.Body>
                    {selectedStudents.length > 0 && (
                        <div className="bulk-actions">
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={handleBulkDelete}
                                className="me-2"
                            >
                                Удалить выбранных ({selectedStudents.length})
                            </Button>
                        </div>
                    )}
                    
                    <ListGroup>
                        <ListGroup.Item className="list-header">
                            <div className="list-header-content">
                                <div className="header-section checkbox-section">
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        label="Выбрать всех"
                                    />
                                </div>
                                <div className="header-section name-section">
                                    <div className="counter-badge">
                                        {getUniqueStudentsCount(filteredStudents)} учеников
                                    </div>
                                </div>
                                <div className="header-section subject-section">
                                    <div className="counter-badge">
                                        {getUniqueSubjectsCount(filteredStudents)} предметов
                                    </div>
                                </div>
                                <div className="header-section class-section">
                                    <div className="counter-badge">
                                        {getUniqueClassesCount(filteredStudents)} классов
                                    </div>
                                </div>
                                <div className="header-section actions-section"></div>
                            </div>
                        </ListGroup.Item>
                        
                        {filteredStudents.map((student, index) => (
                            <ListGroup.Item 
                                key={student.id}
                                className="student-row"
                            >
                                <div className="d-flex align-items-center flex-grow-1">
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectedStudents.includes(student.id)}
                                        onChange={() => handleSelectStudent(student.id)}
                                        className="me-3"
                                    />
                                    <div className="student-login me-3">
                                        {student.username ? (
                                            <span className="login-badge registered">
                                                {student.username}
                                            </span>
                                        ) : (
                                            <span className="login-badge not-registered">
                                                Не зарегистрирован
                                            </span>
                                        )}
                                    </div>
                                    <div className="student-name">
                                        <strong>{student.lastName} {student.firstName} {student.middleName}</strong>
                                        {generateStudentCode(student)}
                                    </div>
                                    <div className="student-details">
                                        <div className="detail-badge subject">
                                            {student.subject}
                                        </div>
                                        <div className="detail-badge grade">
                                            {student.grade}
                                        </div>
                                        <div className="detail-badge index">
                                            {student.index}
                                        </div>
                                    </div>
                                </div>
                                <div className="student-actions">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleStartEdit(student)}
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
            
            {/* Модальное окно подтверждения */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered className="confirm-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Подтвердите действие</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {studentToDelete?.bulk ? (
                        <p>
                            Вы уверены, что хотите удалить следующих учеников:<br/>
                            <strong>{studentToDelete.names}</strong>?
                        </p>
                    ) : studentToDelete && (
                        <p>
                            Вы уверены, что хотите удалить ученика{' '}
                            <strong>
                                {studentToDelete.lastName} {studentToDelete.firstName} {studentToDelete.middleName}
                            </strong>?
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Отмена
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => studentToDelete && handleDeleteStudent(
                            studentToDelete.bulk ? studentToDelete.ids : studentToDelete.id
                        )}
                    >
                        Удалить
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default StudentsList;
