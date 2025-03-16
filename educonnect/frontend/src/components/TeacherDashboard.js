import React, { useState, useEffect } from 'react';
import SidebarTeacher from './layout/SidebarTeacher';
import TeacherProfile from './forms/teachers/TeacherProfile';
import TeacherSubjects from './forms/subjects/SubjectsList';
import StudentsList from './forms/students/StudentsList';
import axios from 'axios';

const TeacherDashboard = () => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectStudents, setSubjectStudents] = useState([]);
  const [selectedSubjectName, setSelectedSubjectName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (selectedSubjectId) {
        try {
          // Получаем все предметы для получения имени выбранного предмета
          const subjectsResponse = await axios.get('/api/v1/subjects/', {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`
            }
          });

          // Находим выбранный предмет и его имя
          const selectedSubject = subjectsResponse.data.find(
            subject => subject.id.toString() === selectedSubjectId
          );
          setSelectedSubjectName(selectedSubject?.name || '');

          // Получаем всех учеников
          const studentsResponse = await axios.get('/api/v1/students/', {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`
            }
          });

          // Фильтруем учеников по выбранному предмету
          const filteredStudents = studentsResponse.data.filter(student => {
            return student.username && // только зарегистрированные
                   student.username !== 'Не зарегистрирован' && // исключаем незарегистрированных
                   student.subject && // проверяем наличие предмета
                   student.subject === selectedSubject?.name; // сравниваем по имени предмета
          });

          setSubjectStudents(filteredStudents);
        } catch (error) {
          console.error('Ошибка при получении данных:', error);
        }
      }
    };

    fetchData();
  }, [selectedSubjectId]);

  const handleNavigate = (view) => {
    if (view.startsWith('students/by-subject/')) {
      const subjectId = view.split('/').pop();
      setSelectedSubjectId(subjectId);
      setCurrentView('students-by-subject');
    } else {
      setCurrentView(view);
      setSelectedSubjectId(null);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <TeacherProfile />;
      case 'subjects':
        return <TeacherSubjects />;
      case 'students':
        return <StudentsList />;
      case 'students-by-subject':
        return (
          <div className="subject-students-list">
            <h3>Предмет: {selectedSubjectName}</h3>
            {subjectStudents.length > 0 ? (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Логин</th>
                    <th>ФИО</th>
                    <th>Класс</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectStudents.map(student => (
                    <tr key={student.id}>
                      <td>
                        <td>{student.username}</td>
                        {/* {`${student.lastName || ''} ${student.firstName || ''} ${student.middleName || ''}`} */}
                      </td>
                      <td>
                      {`${student.lastName || ''} ${student.firstName || ''} ${student.middleName || ''}`}
                      </td>
                      {student.grade ? `${student.grade} ${student.index || ''}` : 'Не указан'}
                      {/* <td>{student.username}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Нет зарегистрированных учеников, изучающих данный предмет</p>
            )}
          </div>
        );
      default:
        return <h1>Панель управления учителя</h1>;
    }
  };

  return (
    <div className="teacher-dashboard">
      <SidebarTeacher 
        activePage={currentView} 
        onNavigate={handleNavigate} 
      />
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default TeacherDashboard; 