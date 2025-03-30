import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import SidebarStudent from './layout/SidebarStudent';
import { useUser } from '../UserContext';
import axios from 'axios';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useUser();
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    grade: '',
    about: '',
    contacts: {},
    subjects: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStudentData = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://127.0.0.1:8000/api/v1/students/profile/', {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });

      setStudentData({
        firstName: response.data.first_name || '',
        lastName: response.data.last_name || '',
        middleName: response.data.middle_name || '',
        grade: response.data.grade || '',
        about: response.data.about || '',
        contacts: response.data.contacts || {},
        subjects: response.data.subjects || []
      });
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  }, [user?.token]); // Зависимость от токена

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]); // Теперь зависим от мемоизированной функции

  return (
    <div className="d-flex student-dashboard">
      <SidebarStudent activePage="student" />
      <Container fluid className="p-4">
        <h2 className="mb-4">Личный кабинет ученика</h2>
        
        {loading && (
          <div className="text-center">
            <p>Загрузка данных...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <Card className="mb-4">
              <Card.Header>
                <h4>Информация об ученике</h4>
              </Card.Header>
              <Card.Body>
                <p><strong>ФИО:</strong> {studentData.lastName} {studentData.firstName} {studentData.middleName}</p>
                <p><strong>Класс:</strong> {studentData.grade}</p>
                {studentData.about && <p><strong>О себе:</strong> {studentData.about}</p>}
              </Card.Body>
            </Card>

            <Row>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header>
                    <h4>Предметы</h4>
                  </Card.Header>
                  <Card.Body>
                    {studentData.subjects && studentData.subjects.length > 0 ? (
                      <ul className="list-unstyled">
                        {studentData.subjects.map((subject, index) => (
                          <li key={index} className="mb-2">
                            {subject}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Нет доступных предметов</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header>
                    <h4>Контактная информация</h4>
                  </Card.Header>
                  <Card.Body>
                    {Object.keys(studentData.contacts).length > 0 ? (
                      <ul className="list-unstyled">
                        {Object.entries(studentData.contacts).map(([key, value]) => (
                          <li key={key} className="mb-2">
                            <strong>{key}:</strong> {value}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Контактная информация не указана</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default StudentDashboard;