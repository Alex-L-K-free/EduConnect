import React, { useState, useEffect, useMemo } from 'react';
import SidebarTeacher from './layout/SidebarTeacher';
import TeacherProfile from './forms/teachers/TeacherProfile';
import TeacherSubjects from './forms/subjects/SubjectsList';
import StudentsList from './forms/students/StudentsList';
import axios from 'axios';

const TeacherDashboard = () => {
  // Загружаем сохраненное состояние из localStorage
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('teacherDashboardView');
    return saved || 'main';
  });

  const [selectedSubjectIds, setSelectedSubjectIds] = useState(() => {
    const saved = localStorage.getItem('teacherSelectedSubjects');
    return saved ? JSON.parse(saved) : [];
  });

  const [subjectStudentsMap, setSubjectStudentsMap] = useState({});
  const [subjectsData, setSubjectsData] = useState({});

  // Добавляем состояние для отслеживания загрузки
  const [isLoading, setIsLoading] = useState(false);

  // Мемоизируем данные предметов
  const memoizedSubjectsData = useMemo(() => subjectsData, [subjectsData]);

  // Сохраняем состояния при их изменении
  useEffect(() => {
    localStorage.setItem('teacherDashboardView', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('teacherSelectedSubjects', JSON.stringify(selectedSubjectIds));
  }, [selectedSubjectIds]);

  // Оптимизированная загрузка данных
  const [studentsData, setStudentsData] = useState(null);

  // Загрузка предметов при монтировании
  useEffect(() => {
    const fetchSubjects = async () => {
      if (Object.keys(subjectsData).length === 0) {
        try {
          const response = await axios.get('/api/v1/subjects/', {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`
            }
          });
          const subjectsMap = {};
          response.data.forEach(subject => {
            subjectsMap[subject.id] = subject;
          });
          setSubjectsData(subjectsMap);
        } catch (error) {
          console.error('Ошибка при загрузке предметов:', error);
        }
      }
    };

    fetchSubjects();
  }, []);

  // Загрузка студентов при изменении выбранных предметов
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSubjectIds.length) return;
      
      setIsLoading(true);
      try {
        const response = await axios.get('/api/v1/students/', {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });
        
        const allStudents = response.data.filter(student => 
          student.username && student.username !== 'Не зарегистрирован'
        );
        const newStudentsBySubject = {};
        
        selectedSubjectIds.forEach(subjectId => {
          const subject = subjectsData[subjectId];
          if (subject) {
            newStudentsBySubject[subjectId] = allStudents.filter(student => 
              student.subject === subject.name
            );
          }
        });

        setStudentsData(allStudents);
        setSubjectStudentsMap(newStudentsBySubject);
      } catch (error) {
        console.error('Ошибка при загрузке студентов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSubjectIds, subjectsData]);

  // Очистка данных при размонтировании
  useEffect(() => {
    return () => {
      setStudentsData(null);
    };
  }, []);

  const handleNavigate = React.useCallback((view) => {
    if (view.startsWith('students/by-subjects/')) {
      const subjectIds = view.split('/').pop().split(',');
      setSelectedSubjectIds(subjectIds);
      setCurrentView('students-by-subjects');
    } else {
      setCurrentView(view);
      setSelectedSubjectIds([]);
      setStudentsData(null);
      setSubjectStudentsMap({});
    }
  }, []);

  const renderStudentsList = (subjectId, students) => {
    const subjectName = subjectsData[subjectId]?.name || '';
    
    if (isLoading) {
      return <div>Загрузка учеников...</div>;
    }
    
    return (
      <div key={subjectId} className="subject-students-list">
        <h3>Предмет: {subjectName}</h3>
        {students && students.length > 0 ? (
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
            {isLoading && <div>Загрузка данных...</div>}
            {!isLoading && selectedSubjectIds.map(subjectId => 
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