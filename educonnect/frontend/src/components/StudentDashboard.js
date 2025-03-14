import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import SidebarStudent from './layout/SidebarStudent';
import { useUser } from '../UserContext';
import '../styles/components/StudentDashboard.scss';

const StudentDashboard = () => {
  const { user } = useUser();
  const [studentInfo, setStudentInfo] = useState({
    subjects: [],
    teachers: [],
    grade: '',
    gradeIndex: '',
    firstName: '',
    lastName: '',
    teachersInfo: []  // Добавляем информацию об учителях
  });

  useEffect(() => {
    if (user) {
      setStudentInfo({
        subjects: user.subjects || [],
        teachers: user.teachers || [],
        grade: user.grade || '',
        gradeIndex: user.grade?.match(/\d+/)?.[0] || '', // Извлекаем числовой индекс класса
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        teachersInfo: user.teachers || []
      });
    }
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
            <p><strong>Класс:</strong> {studentInfo.grade} ({studentInfo.gradeIndex})</p>
          </Card.Body>
        </Card>

        {/* Предметы и учителя */}
        <Card className="mb-4">
          <Card.Header>
            <h4>Мои предметы и учителя</h4>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Предмет</th>
                  <th>Учитель</th>
                  <th>Класс</th>
                </tr>
              </thead>
              <tbody>
                {studentInfo.subjects.map((subject, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{subject}</td>
                    <td>{studentInfo.teachers[index] || 'Не назначен'}</td>
                    <td>{studentInfo.grade}</td>
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