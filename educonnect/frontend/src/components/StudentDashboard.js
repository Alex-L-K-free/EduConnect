import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import SidebarStudent from './layout/SidebarStudent';
import './StudentDashboard.css';

const StudentDashboard = () => {
  return (
    <div className="d-flex student-dashboard">
      <SidebarStudent />
      <Container fluid className="p-4">
        <h2 className="mb-4">Личный кабинет ученика</h2>
        
        <Card className="mb-4">
          <Card.Header>
            <h4>Добро пожаловать!</h4>
          </Card.Header>
          <Card.Body>
            <p>Здесь будет отображаться информация о вашем обучении.</p>
          </Card.Body>
        </Card>

        <Row>
          <Col md={12}>
            <Card className="mb-4 stats-card">
              <Card.Header>
                <h4>Информация</h4>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <p>Функционал в разработке</p>
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