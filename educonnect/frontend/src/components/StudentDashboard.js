import React, { useState, useEffect, useCallback } from 'react';
import { Container } from 'react-bootstrap';
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
    subjects: [],
    teacher: {
      firstName: '',
      lastName: '',
      middleName: '',
      subjects: [],
      contacts: {}
    }
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
        subjects: response.data.subjects || [],
        teacher: response.data.teacher || {
          firstName: '',
          lastName: '',
          middleName: '',
          subjects: [],
          contacts: {}
        }
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
        {/* <h2 className="mb-4">Личный кабинет ученика</h2> */}
        
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
          <div className="student-tiles">
            <div className="info-tile">
              <div className="tile-header">
                <span className="tile-icon">👤</span>
                <h3 className="tile-title">Личная информация</h3>
              </div>
              <div className="tile-content">
                <ul>
                  <li><strong>Фамилия:</strong> {studentData.lastName}</li>
                  <li><strong>Имя:</strong> {studentData.firstName}</li>
                  <li><strong>Отчество:</strong> {studentData.middleName}</li>
                  <li><strong>Класс:</strong> {studentData.grade}</li>
                </ul>
              </div>
            </div>

            <div className="info-tile">
              <div className="tile-header">
                <span className="tile-icon">📚</span>
                <h3 className="tile-title">Предметы</h3>
              </div>
              <div className="tile-content">
                {studentData.subjects && studentData.subjects.length > 0 ? (
                  <ul>
                    {studentData.subjects.map((subject, index) => (
                      <li key={index}>{subject}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Нет доступных предметов</p>
                )}
              </div>
            </div>

            <div className="info-tile">
              <div className="tile-header">
                <span className="tile-icon">📞</span>
                <h3 className="tile-title">Контактная информация</h3>
              </div>
              <div className="tile-content">
                {Object.keys(studentData.contacts).length > 0 ? (
                  <ul>
                    {Object.entries(studentData.contacts).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Контактная информация не указана</p>
                )}
              </div>
            </div>

            <div className="info-tile">
              <div className="tile-header">
                <span className="tile-icon">ℹ️</span>
                <h3 className="tile-title">Дополнительно</h3>
              </div>
              <div className="tile-content">
                {studentData.about ? (
                  <p>{studentData.about}</p>
                ) : (
                  <p>Дополнительная информация отсутствует</p>
                )}
              </div>
            </div>

            <div className="info-tile">
              <div className="tile-header">
                <span className="tile-icon">👨‍🏫</span>
                <h3 className="tile-title">Учитель</h3>
              </div>
              <div className="tile-content">
                {studentData.teacher && studentData.teacher.lastName ? (
                  <ul>
                    <li>
                      <strong>ФИО:</strong> {`${studentData.teacher.lastName} ${studentData.teacher.firstName} ${studentData.teacher.middleName || ''}`}
                    </li>
                    {studentData.teacher.subjects && studentData.teacher.subjects.length > 0 && (
                      <li>
                        <strong>Предметы:</strong> {studentData.teacher.subjects.join(', ')}
                      </li>
                    )}
                    {Object.entries(studentData.teacher.contacts || {}).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Информация о учителе отсутствует</p>
                )}
              </div>
            </div>
            
          </div>
        )}
      </Container>
    </div>
  );
};

export default StudentDashboard;