import React from 'react';
import { Table, Button } from 'react-bootstrap';
import './TeachersListAdmin.css';

const TeachersListAdmin = ({ teachers, onAddTeacher }) => {
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
              <td>{teacher.middle_name}</td>
              <td>
                <Button variant="outline-primary" size="sm">
                  Редактировать
                </Button>
                {' '}
                <Button variant="outline-danger" size="sm">
                  Удалить
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TeachersListAdmin; 