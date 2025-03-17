import React, { useState, useEffect } from 'react';
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

  const [selectedClassIds, setSelectedClassIds] = useState(() => {
    const saved = localStorage.getItem('teacherSelectedClasses');
    return saved ? JSON.parse(saved) : [];
  });

  const [subjectStudentsMap, setSubjectStudentsMap] = useState({});
  const [classStudentsMap, setClassStudentsMap] = useState({});
  const [subjectsData, setSubjectsData] = useState({});

  // Добавляем состояние для отслеживания загрузки
  const [isLoading, setIsLoading] = useState(false);

  // Сохраняем состояния при их изменении
  useEffect(() => {
    localStorage.setItem('teacherDashboardView', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('teacherSelectedSubjects', JSON.stringify(selectedSubjectIds));
  }, [selectedSubjectIds]);

  useEffect(() => {
    localStorage.setItem('teacherSelectedClasses', JSON.stringify(selectedClassIds));
  }, [selectedClassIds]);

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
  }, [subjectsData]); // Добавляем subjectsData в зависимости

  // Загрузка студентов при изменении выбранных предметов или классов
  useEffect(() => {
    const fetchStudents = async () => {
      // Проверяем условия для запуска фильтрации
      const shouldFetchBySubjects = currentView === 'students-by-subjects' && selectedSubjectIds.length > 0;
      const shouldFetchByClasses = currentView === 'students-by-classes' && selectedClassIds.length > 0;
      
      if (!shouldFetchBySubjects && !shouldFetchByClasses) return;
      
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
        
        // Фильтрация по предметам
        if (shouldFetchBySubjects) {
          const newStudentsBySubject = {};
          selectedSubjectIds.forEach(subjectId => {
            const subject = subjectsData[subjectId];
            if (subject) {
              newStudentsBySubject[subjectId] = allStudents.filter(student => 
                student.subject === subject.name
              );
            }
          });
          setSubjectStudentsMap(newStudentsBySubject);
        }

        // Фильтрация по классам
        if (shouldFetchByClasses) {
          const newStudentsByClass = {};
          selectedClassIds.forEach(classId => {
            newStudentsByClass[classId] = allStudents.filter(student =>
              `class-${student.grade}${student.index}` === classId
            );
          });
          setClassStudentsMap(newStudentsByClass);
        }

      } catch (error) {
        console.error('Ошибка при загрузке студентов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSubjectIds, selectedClassIds, subjectsData, currentView]);

  // Очистка данных при размонтировании
  useEffect(() => {
    return () => {
      setSubjectStudentsMap({});
      setClassStudentsMap({});
    };
  }, []);

  const handleNavigate = React.useCallback((view) => {
    if (view.startsWith('students/by-subjects/')) {
      const subjectIds = view.split('/').pop().split(',');
      setSelectedSubjectIds(subjectIds);
      setCurrentView('students-by-subjects');
    } else if (view.startsWith('students/by-classes/')) {
      const classIds = view.split('/').pop().split(',');
      setSelectedClassIds(classIds);
      setCurrentView('students-by-classes');
    } else {
      setCurrentView(view);
      setSelectedSubjectIds([]);
      setSelectedClassIds([]);
      setSubjectStudentsMap({});
      setClassStudentsMap({});
    }
  }, []);

  const renderStudentsList = (subjectId, students) => {
    const subjectName = subjectsData[subjectId]?.name || '';
    
    if (isLoading) {
      return <div>Загрузка учеников...</div>;
    }

    // Фильтруем студентов по выбранным классам
    let filteredStudents = students;
    if (selectedClassIds.length > 0) {
      filteredStudents = students.filter(student =>
        selectedClassIds.some(classId => 
          `class-${student.grade}${student.index}` === classId
        )
      );
    }

    // Получаем список классов только из отфильтрованных студентов
    const actualClasses = Array.from(new Set(
      filteredStudents.map(student => `${student.grade}${student.index || ''}`)
    )).sort();
    
    return (
      <div key={subjectId} className="subject-students-list">
        <h3>
          Предмет: {subjectName}
          {actualClasses.length > 0 && (
            <span className="selected-classes">
              {' '}(Классы: {actualClasses.join(', ')})
            </span>
          )}
        </h3>
        {filteredStudents && filteredStudents.length > 0 ? (
          <table className="students-table">
            <thead>
              <tr>
                <th>Логин</th>
                <th>ФИО</th>
                <th>Класс</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.username}</td>
                  <td>{`${student.lastName} ${student.firstName} ${student.middleName || ''}`}</td>
                  <td>{`${student.grade}${student.index || ''}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Нет учеников, соответствующих выбранным критериям</p>
        )}
      </div>
    );
  };

  const renderClassStudentsList = (classId, students) => {
    const className = classId.replace('class-', '');
    
    if (isLoading) {
      return <div>Загрузка учеников...</div>;
    }
    
    return (
      <div key={classId} className="class-students-list">
        <h3>Класс: {className}</h3>
        {students && students.length > 0 ? (
          <table className="students-table">
            <thead>
              <tr>
                <th>Логин</th>
                <th>ФИО</th>
                <th>Предмет</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.username}</td>
                  <td>{`${student.lastName} ${student.firstName} ${student.middleName || ''}`}</td>
                  <td>{student.subject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Нет зарегистрированных учеников в данном классе</p>
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
      case 'students-by-classes':
        // Если выбраны предметы, отображаем их с фильтрацией по классам
        if (selectedSubjectIds.length > 0) {
          return (
            <div>
              {isLoading && <div>Загрузка данных...</div>}
              {!isLoading && selectedSubjectIds.map(subjectId => 
                renderStudentsList(subjectId, subjectStudentsMap[subjectId] || [])
              )}
            </div>
          );
        }
        // Если предметы не выбраны, отображаем список по классам
        return (
          <div>
            {isLoading && <div>Загрузка данных...</div>}
            {!isLoading && selectedClassIds.map(classId => 
              renderClassStudentsList(classId, classStudentsMap[classId] || [])
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