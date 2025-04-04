import React, { useState, useEffect, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useLocation } from 'react-router-dom';
import SidebarStudent from './layout/SidebarStudent';
import SlideTransition from './forms/students/SlideTransition';
import { useUser } from '../UserContext';
import axios from 'axios';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { subjects } = useParams();
  const location = useLocation();
  const { user } = useUser();
  
  // Определяем activePage на основе URL
  const activePage = location.pathname.includes('/subjects') ? 'subjects' : 'student';

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
    subjects_details: [],
    subject: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    description: '',
    file: null
  });
  const [uploadError, setUploadError] = useState(null);

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
        subjects_details: response.data.subjects_details || [],
        subject: response.data.subject || ''
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

  const handleUploadClick = () => {
    setUploadModalOpen(true);
    setUploadError(null);
  };

  const handleUploadClose = () => {
    setUploadModalOpen(false);
    setUploadData({
      description: '',
      file: null
    });
    setUploadError(null);
  };

  const handleUploadSubmit = async (subjectName) => {
    try {
      if (!uploadData.file) {
        setUploadError('Пожалуйста, выберите файл');
        return;
      }

      // Проверяем наличие токена
      if (!user?.token) {
        setUploadError('Ошибка авторизации: токен отсутствует');
        return;
      }

      const formData = new FormData();
      formData.append('title', uploadData.file.name);
      formData.append('description', uploadData.description);
      formData.append('file', uploadData.file);
      formData.append('subject', subjectName);
      formData.append('is_student_material', 'true');

      const response = await axios.post('http://127.0.0.1:8000/api/v1/materials/student-upload/', formData, {
        headers: {
          'Authorization': `Token ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        handleUploadClose();
        loadStudentData();
      }
    } catch (error) {
      console.error('Upload error details:', error.response?.data);
      setUploadError(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Ошибка при загрузке материала'
      );
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/v1/materials/${materialId}/`, {
          headers: {
            'Authorization': `Token ${user.token}`
          }
        });
        loadStudentData();
      } catch (error) {
        setError('Ошибка при удалении материала');
        console.error('Delete error:', error);
      }
    }
  };

  const renderContent = () => {
    if (activePage === 'subjects' && !subjects) {
      // Если мы на странице предметов, но ничего не выбрано
      return (
        <div className="student-tiles subjects-view">
          <div className="info-tile subjects-tile">
            <div className="tile-content text-center">
              <div className="empty-subjects-message">
                <span className="message-icon">📚</span>
                <h4>Выберите предметы</h4>
                <p>Отметьте галочками интересующие вас предметы в меню слева</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (subjects) {
      // Разбиваем строку предметов на массив
      const selectedSubjects = subjects.split(',');
      
      return (
        <div className="student-tiles subjects-view">
          {selectedSubjects.map(subjectName => {
            const subjectDetails = studentData.subjects_details?.find(
              detail => detail.name === subjectName
            );

            return (
              <div key={subjectName} className="info-tile subjects-tile">
                <div className="tile-header">
                  <span className="tile-icon">📚</span>
                  <h3 className="tile-title">
                    {subjectName} ({studentData.grade}{studentData.index})
                  </h3>
                </div>
                <div className="tile-content">
                  {subjectDetails ? (
                    <div className="subject-card">
                      <div className="subject-materials teacher-materials">
                        <h5>Материалы от учителя:</h5>
                        <div className="materials-list">
                          {subjectDetails.materials?.filter(m => !m.is_student_material).map((material) => (
                            <div key={material.id} className="material-item">
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
                              {material.file && (
                                <a 
                                  href={`http://127.0.0.1:8000${material.file}`}
                                  className="material-download-btn"
                                  download={material.title}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    fetch(`http://127.0.0.1:8000${material.file}`, {
                                      headers: {
                                        'Authorization': `Token ${user.token}`
                                      }
                                    })
                                    .then(response => response.blob())
                                    .then(blob => {
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.setAttribute('download', material.title);
                                      document.body.appendChild(link);
                                      link.click();
                                      link.remove();
                                      window.URL.revokeObjectURL(url);
                                    })
                                    .catch(error => {
                                      console.error('Ошибка при скачивании:', error);
                                      setError('Ошибка при скачивании файла');
                                    });
                                  }}
                                >
                                  <span className="download-icon">⭳</span>
                                  <span>Скачать материал</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="subject-materials student-materials">
                        <div className="student-materials-header">
                          <h5>Ваши материалы:</h5>
                          <button 
                            className="upload-material-btn"
                            onClick={handleUploadClick}
                          >
                            <span>📤</span>
                            <span>Загрузить материал</span>
                          </button>
                        </div>
                        <div className="materials-list">
                          {subjectDetails.materials?.filter(m => m.is_student_material).map((material) => (
                            <div key={material.id} className="material-item student-material">
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
                              <div className="material-actions">
                                <a 
                                  href={`http://127.0.0.1:8000${material.file}`}
                                  className="material-download-btn"
                                  download={material.title}
                                >
                                  <span>⭳</span>
                                  <span>Скачать</span>
                                </a>
                                <button 
                                  className="material-delete-btn"
                                  onClick={() => handleDeleteMaterial(material.id)}
                                >
                                  <span>🗑️</span>
                                  <span>Удалить</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>Предмет не найден</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Если предмет не выбран, показываем стандартный дашборд
    return (
      <div className="student-tiles">
        {/* Временно скрыта плитка "Личная информация"
        <div className="info-tile">
          <div className="tile-header">
            <span className="tile-icon">��</span>
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
        */}

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
                    <li key={index} className={classmate.isRegistered ? 'registered-student' : ''}>
                      {`${classmate.lastName} ${classmate.firstName}`}
                      {classmate.isRegistered && (
                        <span className="registration-badge" title="Зарегистрирован">
                          ✓
                        </span>
                      )}
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
            <h3 className="tile-title">Твой предмет</h3>
          </div>
          <div className="tile-content">
            {studentData.subject ? (
              <div className="subjects-grid">
                {studentData.subject.split(',').map((subject, index) => {
                  const subjectName = subject.trim();
                  if (!subjectName) return null;
                  
                  const subjectDetails = studentData.subjects_details.find(
                    detail => detail.name === subjectName
                  ) || { materials: [] };

                  return (
                    <div key={index} className="subject-card">
                      <h4 className="subject-name">
                        {subjectName} ({studentData.grade}{studentData.index})
                      </h4>
                      <div className="subject-materials">
                        {subjectDetails.materials && subjectDetails.materials.length > 0 ? (
                          <div className="materials-available">
                            Доступно материалов: {subjectDetails.materials.length}
                          </div>
                        ) : (
                          <p className="no-materials">Материалы пока не добавлены</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>Нет доступных предметов</p>
            )}
          </div>
        </div>

        {/* Временно скрыта плитка "Контактная информация"
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
        */}

        {/* Временно скрыта плитка "Дополнительно"
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
        */}

        <div className="info-tile">
          <div className="tile-header">
            <span className="tile-icon">👨‍🏫</span>
            <h3 className="tile-title">Твой учитель</h3>
          </div>
          <div className="tile-content">
            {studentData.teacher ? (
              <div>
                <h4>{`${studentData.teacher.last_name} ${studentData.teacher.first_name} ${studentData.teacher.middle_name || ''}`}</h4>
                
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
    );
  };

  return (
    <div className="d-flex student-dashboard">
      <SidebarStudent activePage={activePage} />
      <SlideTransition>
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

          {!loading && !error && renderContent()}

          {/* Модальное окно загрузки */}
          {uploadModalOpen && (
            <div className="upload-modal" onClick={handleUploadClose}>
              <div className="upload-modal-content" onClick={e => e.stopPropagation()}>
                <h4>Загрузка материала</h4>
                {uploadError && (
                  <div className="alert alert-danger">
                    {uploadError}
                  </div>
                )}
                <form className="upload-form" onSubmit={e => {
                  e.preventDefault();
                  handleUploadSubmit(subjects);
                }}>
                  <textarea
                    placeholder="Описание материала (необязательно)"
                    value={uploadData.description}
                    onChange={e => setUploadData({...uploadData, description: e.target.value})}
                  />
                  <input
                    type="file"
                    onChange={e => setUploadData({...uploadData, file: e.target.files[0]})}
                    required
                  />
                  <div className="upload-form-buttons">
                    <button type="button" className="cancel-btn" onClick={handleUploadClose}>
                      Отмена
                    </button>
                    <button type="submit" className="submit-btn">
                      Загрузить
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </Container>
      </SlideTransition>
    </div>
  );
};

export default StudentDashboard;