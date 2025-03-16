import React, { useState, useEffect } from 'react';
import SidebarTeacher from './layout/SidebarTeacher';
import TeacherProfile from './forms/teachers/TeacherProfile';
import TeacherSubjects from './forms/subjects/SubjectsList';
import StudentsList from './forms/students/StudentsList';
import axios from 'axios';

const TeacherDashboard = () => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [subjectStudentsMap, setSubjectStudentsMap] = useState({});
  const [subjectsData, setSubjectsData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (selectedSubjectIds.length > 0) {
        try {
          // Получаем все предметы
          const subjectsResponse = await axios.get('/api/v1/subjects/', {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`
            }
          });

          // Создаем мапу предметов для быстрого доступа
          const subjectsMap = {};
          subjectsResponse.data.forEach(subject => {
            subjectsMap[subject.id] = subject;
          });
          setSubjectsData(subjectsMap);

          // Получаем всех учеников
          const studentsResponse = await axios.get('/api/v1/students/', {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`
            }
          });

          // Группируем учеников по предметам
          const studentsBySubject = {};
          selectedSubjectIds.forEach(subjectId => {
            const subjectName = subjectsMap[subjectId]?.name;
            studentsBySubject[subjectId] = studentsResponse.data.filter(student => 
              student.username && 
              student.username !== 'Не зарегистрирован' &&
              student.subject && 
              student.subject === subjectName
            );
          });

          setSubjectStudentsMap(studentsBySubject);
        } catch (error) {
          console.error('Ошибка при получении данных:', error);
        }
      }
    };

    fetchData();
  }, [selectedSubjectIds]);

  const handleNavigate = (view) => {
    if (view.startsWith('students/by-subjects/')) {
      const subjectIds = view.split('/').pop().split(',');
      setSelectedSubjectIds(subjectIds);
      setCurrentView('students-by-subjects');
    } else {
      setCurrentView(view);
      setSelectedSubjectIds([]);
    }
  };

  const renderStudentsList = (subjectId, students) => {
    const subjectName = subjectsData[subjectId]?.name || '';
    
    return (
      <div key={subjectId} className="subject-students-list">
        <h3>Предмет: {subjectName}</h3>
        {students.length > 0 ? (
          <table className="students-table">
            <thead>
              <tr>
                <th>Логин</th>
                <th>ФИО</th>
                <th>Класс</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.username}</td>
                  <td>{`${student.lastName} ${student.firstName} ${student.middleName || ''}`}</td>
                  <td>{`${student.grade} ${student.index || ''}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Нет зарегистрированных учеников, изучающих данный предмет</p>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <TeacherProfile />;
      case 'subjects':
        return <TeacherSubjects />;
      case 'students':
        return <StudentsList />;
      case 'students-by-subjects':
        return (
          <div>
            {selectedSubjectIds.map(subjectId => 
              renderStudentsList(subjectId, subjectStudentsMap[subjectId] || [])
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