import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import SidebarStudent from './layout/SidebarStudent';
import { useUser } from '../UserContext';
import '../styles/components/StudentDashboard.scss';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useUser();
  const [studentInfo, setStudentInfo] = useState({
    subjects: [],
    teachers: [],
    grade: '',
    gradeIndex: '',
    firstName: '',
    lastName: '',
    teacherInfo: null // Добавляем информацию об учителе
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      if (user && user.token) {
        try {
          // Получаем данные о текущем ученике
          const response = await axios.get('http://127.0.0.1:8000/api/v1/students/current/', {
            headers: {
              'Authorization': `Token ${user.token}`
            }
          });

          // Получаем данные об учителе
          const teacherResponse = await axios.get(`http://127.0.0.1:8000/api/v1/teachers/${response.data.teacher}/`, {
            headers: {
              'Authorization': `Token ${user.token}`
            }
          });

          setStudentInfo(prev => ({
            ...prev,
            subjects: response.data.subjects || [],
            grade: response.data.grade || '',
            gradeIndex: response.data.index || '',
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            teacherInfo: teacherResponse.data
          }));
        } catch (error) {
          console.error('Ошибка при загрузке данных:', error);
        }
      }
    };

    fetchStudentData();
  }, [user]);

  return (
    <div className="d-flex student-dashboard">
      <SidebarStudent />
      <Container fluid className="p-4">
        <h2 className="mb-4">Личный кабинет ученика</h2>
        
        {/* Информация об ученике */}
        <Card className="mb-4">
          <Card.Header>
            <h4>Личная информация</h4>
          </Card.Header>
          <Card.Body>
            <p><strong>ФИО:</strong> {studentInfo.lastName} {studentInfo.firstName}</p>
            <p><strong>Класс:</strong> {studentInfo.grade} {studentInfo.gradeIndex}</p>
          </Card.Body>
        </Card>

        {/* Информация об учителе */}
        <Card className="mb-4">
          <Card.Header>
            <h4>Мой учитель</h4>
          </Card.Header>
          <Card.Body>
            {studentInfo.teacherInfo ? (
              <>
                <p><strong>ФИО:</strong> {studentInfo.teacherInfo.lastName} {studentInfo.teacherInfo.firstName} {studentInfo.teacherInfo.middleName}</p>
                <p><strong>Школа:</strong> {studentInfo.teacherInfo.school_name}</p>
                {studentInfo.teacherInfo.contacts && (
                  <div>
                    <strong>Контакты:</strong>
                    <ul className="list-unstyled mt-2">
                      {Object.entries(studentInfo.teacherInfo.contacts).map(([type, value]) => (
                        <li key={type}><strong>{type}:</strong> {value}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p>Загрузка информации об учителе...</p>
            )}
          </Card.Body>
        </Card>

        {/* Предметы и успеваемость */}
        <Card className="mb-4">
          <Card.Header>
            <h4>Мои предметы</h4>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Предмет</th>
                  <th>Учитель</th>
                  <th>Прогресс</th>
                </tr>
              </thead>
              <tbody>
                {studentInfo.subjects.map((subject, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{subject.name}</td>
                    <td>{studentInfo.teacherInfo?.firstName} {studentInfo.teacherInfo?.lastName}</td>
                    <td>
                      <div className="progress">
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${subject.progress || 0}%` }}
                          aria-valuenow={subject.progress || 0} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        >
                          {subject.progress || 0}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Статистика */}
        <Row>
          <Col md={4}>
            <Card className="mb-4 stats-card">
              <Card.Header>
                <h4>Статистика по предметам</h4>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-3">
                  <h5>Всего предметов</h5>
                  <h2>{studentInfo.subjects.length}</h2>
                </div>
                <div className="subject-list">
                  {studentInfo.subjects.map((subject, index) => (
                    <div key={index} className="subject-item">
                      {subject}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="mb-4 stats-card">
              <Card.Header>
                <h4>Статистика по учителям</h4>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-3">
                  <h5>Всего учителей</h5>
                  <h2>{new Set(studentInfo.teachers).size}</h2>
                </div>
                <div className="teachers-list">
                  {Array.from(new Set(studentInfo.teachers)).map((teacher, index) => (
                    <div key={index} className="teacher-item">
                      {teacher}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="mb-4 stats-card">
              <Card.Header>
                <h4>Информация о классе</h4>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <h5>Класс</h5>
                  <h2>{studentInfo.grade}</h2>
                  <p>Индекс класса: {studentInfo.gradeIndex}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StudentDashboard;