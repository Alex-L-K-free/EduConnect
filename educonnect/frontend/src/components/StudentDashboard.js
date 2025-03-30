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
    index: '',
    classmates: [],
    about: '',
    contacts: {},
    teacher: null,
    subjects_details: []
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

      console.log('Received data:', response.data);

      setStudentData({
        firstName: response.data.first_name || '',
        lastName: response.data.last_name || '',
        middleName: response.data.middle_name || '',
        grade: response.data.grade || '',
        index: response.data.index || '',
        classmates: response.data.classmates || [],
        about: response.data.about || '',
        contacts: response.data.contacts || {},
        teacher: response.data.teacher || null,
        subjects_details: response.data.subjects_details || []
      });
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

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
                </ul>
              </div>
            </div>

            {/* Добавим новую плитку с информацией о классе после личной информации */}
            <div className="info-tile">
              <div className="tile-header">
                <span className="tile-icon">🏫</span>
                <h3 className="tile-title">Твой класс</h3>
              </div>
              <div className="tile-content">
                <h4 className="class-title">{studentData.grade}{studentData.index}</h4>
                {studentData.classmates && studentData.classmates.length > 0 ? (
                  <div className="classmates-list">
                    <strong>Одноклассники:</strong>
                    <ul>
                      {studentData.classmates.map((classmate, index) => (
                        <li key={index}>
                          {`${classmate.lastName} ${classmate.firstName}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>Информация о классе отсутствует</p>
                )}
              </div>
            </div>

            <div className="info-tile subjects-tile">
              <div className="tile-header">
                <span className="tile-icon">📚</span>
                <h3 className="tile-title">Твои предметы</h3>
              </div>
              <div className="tile-content">
                {studentData.subjects_details && studentData.subjects_details.length > 0 ? (
                  <div className="subjects-grid">
                    {studentData.subjects_details.map((subject, index) => (
                      <div key={index} className="subject-card">
                        <h4 className="subject-name">{subject.name}</h4>
                        <div className="subject-materials">
                          {subject.materials && subject.materials.length > 0 ? (
                            <>
                              <h5>Материалы по предмету:</h5>
                              <div className="materials-list">
                                {subject.materials.map((material, idx) => (
                                  <div key={idx} className="material-item">
                                    <div className="material-header">
                                      <h6>{material.title}</h6>
                                      <span className="material-date">
                                        {new Date(material.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {material.description && (
                                      <p className="material-description">{material.description}</p>
                                    )}
                                    <div className="material-type">
                                      <span className="file-type-icon">
                                        {material.material_type === 'document' && '📄'}
                                        {material.material_type === 'video' && '🎥'}
                                        {material.material_type === 'presentation' && '📊'}
                                      </span>
                                      <span className="file-type-text">{material.material_type}</span>
                                    </div>
                                    {material.file_url && (
                                      <a 
                                        href={material.file_url} 
                                        className="material-download"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Скачать материал
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p className="no-materials">Материалы пока не добавлены</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                <h3 className="tile-title">Твой учитель</h3>
              </div>
              <div className="tile-content">
                {studentData.teacher ? (
                  <div>
                    <h4>{`${studentData.teacher.last_name} ${studentData.teacher.first_name} ${studentData.teacher.middle_name || ''}`}</h4>
                    
                    {studentData.teacher.specialization && (
                      <div className="teacher-specialization">
                        <strong>Специализация:</strong>
                        <p>{studentData.teacher.specialization}</p>
                      </div>
                    )}

                    {studentData.teacher.school_name && (
                      <div className="teacher-school">
                        <strong>Школа:</strong>
                        <p>{studentData.teacher.school_name}</p>
                      </div>
                    )}

                    {studentData.teacher.about && (
                      <div className="teacher-about">
                        <strong>О преподавателе:</strong>
                        <p>{studentData.teacher.about}</p>
                      </div>
                    )}

                    {studentData.teacher.contacts && Object.keys(studentData.teacher.contacts).length > 0 && (
                      <div className="teacher-contacts">
                        <strong>Контакты:</strong>
                        <ul>
                          {Object.entries(studentData.teacher.contacts).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(studentData.teacher.telegram || studentData.teacher.viber) && (
                      <div className="teacher-messenger">
                        <strong>Мессенджеры:</strong>
                        <ul>
                          {studentData.teacher.telegram && (
                            <li><strong>Telegram:</strong> {studentData.teacher.telegram}</li>
                          )}
                          {studentData.teacher.viber && (
                            <li><strong>Viber:</strong> {studentData.teacher.viber}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
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