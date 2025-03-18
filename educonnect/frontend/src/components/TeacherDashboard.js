import React, { useState, useEffect } from 'react';
import SidebarTeacher from './layout/SidebarTeacher';
import TeacherProfile from './forms/teachers/TeacherProfile';
import TeacherSubjects from './forms/subjects/SubjectsList';
import StudentsList from './forms/students/StudentsList';
import StudentActions, { MaterialCell } from './forms/teachers/StudentActions';
import axios from 'axios';
import './TeacherDashboard.css';

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

  // Добавляем состояния для доступных предметов и классов
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  // Добавляем состояние для выбранных учеников
  const [selectedStudents, setSelectedStudents] = useState({});

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

  // Добавляем useEffect для обновления доступных предметов и классов
  useEffect(() => {
    if (!subjectStudentsMap || !classStudentsMap) return;

    // Получаем доступные предметы на основе выбранных классов
    const getAvailableSubjects = () => {
      if (selectedClassIds.length === 0) return Object.keys(subjectsData);

      const availableSubs = new Set();
      selectedClassIds.forEach(classId => {
        const classStudents = classStudentsMap[classId] || [];
        classStudents.forEach(student => {
          const subjectId = Object.keys(subjectsData).find(
            id => subjectsData[id].name === student.subject
          );
          if (subjectId) availableSubs.add(subjectId);
        });
      });
      return Array.from(availableSubs);
    };

    // Получаем доступные классы на основе выбранных предметов
    const getAvailableClasses = () => {
      if (selectedSubjectIds.length === 0) return [];

      const availableClss = new Set();
      selectedSubjectIds.forEach(subjectId => {
        const subjectStudents = subjectStudentsMap[subjectId] || [];
        subjectStudents.forEach(student => {
          const classId = `class-${student.grade}${student.index}`;
          availableClss.add(classId);
        });
      });
      return Array.from(availableClss);
    };

    setAvailableSubjects(getAvailableSubjects());
    setAvailableClasses(getAvailableClasses());
  }, [selectedSubjectIds, selectedClassIds, subjectStudentsMap, classStudentsMap, subjectsData]);

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

  const handleSelectAllStudents = (classKey, students) => {
    const newSelected = { ...selectedStudents };
    const allSelected = students.every(student => selectedStudents[student.id]);
    
    students.forEach(student => {
      newSelected[student.id] = !allSelected;
    });
    
    setSelectedStudents(newSelected);
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Добавляем функцию сортировки студентов
  const sortStudents = (students) => {
    return [...students].sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });
  };

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

    // Группируем студентов по классам
    const studentsByClass = {};
    filteredStudents.forEach(student => {
      const classKey = `${student.grade}${student.index || ''}`;
      if (!studentsByClass[classKey]) {
        studentsByClass[classKey] = [];
      }
      studentsByClass[classKey].push(student);
    });

    // Сортируем студентов в каждом классе
    Object.keys(studentsByClass).forEach(classKey => {
      studentsByClass[classKey] = sortStudents(studentsByClass[classKey]);
    });

    // Сортируем классы
    const sortedClasses = Object.keys(studentsByClass).sort();
    
    return (
      <div key={subjectId} className="subject-students-list">
        {sortedClasses.map(classKey => (
          <div key={`${subjectId}-${classKey}`}>
            <h3>
              Предмет: {subjectName}
              <span className="selected-classes">
                {' '} Класс: {classKey}
              </span>
            </h3>
            <table className="students-table">
              <thead>
                <tr>
                  <th>
                    <div className="select-all-header">
                      <input
                        type="checkbox"
                        className="student-checkbox"
                        checked={studentsByClass[classKey].every(student => selectedStudents[student.id])}
                        onChange={() => handleSelectAllStudents(classKey, studentsByClass[classKey])}
                      />
                    </div>
                  </th>
                  <th>Ученик</th>
                  <th className="add-material-column">
                    <StudentActions 
                      students={studentsByClass[classKey]}
                      selectedStudents={selectedStudents}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentsByClass[classKey].map(student => (
                  <tr 
                    key={student.id}
                    className={selectedStudents[student.id] ? 'selected-row' : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="student-checkbox"
                        checked={selectedStudents[student.id] || false}
                        onChange={() => handleSelectStudent(student.id)}
                      />
                    </td>
                    <td>{`${student.lastName} ${student.firstName} ${student.middleName || ''}`}</td>
                    <MaterialCell materials={student.materials} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const renderClassStudentsList = (classId, students) => {
    const className = classId.replace('class-', '');
    
    if (isLoading) {
      return <div>Загрузка учеников...</div>;
    }

    // Сортируем список учеников
    const sortedStudents = sortStudents(students);
    
    return (
      <div key={classId} className="class-students-list">
        <h3>Класс: {className}</h3>
        {sortedStudents && sortedStudents.length > 0 ? (
          <table className="students-table">
            <thead>
              <tr>
                <th>
                  <div className="select-all-header">
                    <input
                      type="checkbox"
                      className="student-checkbox"
                      checked={sortedStudents.every(student => selectedStudents[student.id])}
                      onChange={() => handleSelectAllStudents(className, sortedStudents)}
                    />
                    <span>Выбрать всех</span>
                  </div>
                </th>
                <th>Логин</th>
                <th>ФИО</th>
                <th>Предмет</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map(student => (
                <tr 
                  key={student.id}
                  className={selectedStudents[student.id] ? 'selected-row' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="student-checkbox"
                      checked={selectedStudents[student.id] || false}
                      onChange={() => handleSelectStudent(student.id)}
                    />
                  </td>
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
            {!isLoading && selectedSubjectIds
              .map(subjectId => {
                const students = subjectStudentsMap[subjectId] || [];
                // Фильтруем студентов по классам, если есть выбранные классы
                const filteredStudents = selectedClassIds.length > 0
                  ? students.filter(student =>
                      selectedClassIds.some(classId => 
                        `class-${student.grade}${student.index}` === classId
                      )
                    )
                  : students;
                
                // Возвращаем null если нет студентов, иначе рендерим список
                return filteredStudents.length > 0 
                  ? renderStudentsList(subjectId, students)
                  : null;
              })
              .filter(Boolean) // Удаляем null элементы
            }
          </div>
        );
      case 'students-by-classes':
        if (selectedSubjectIds.length > 0) {
          return (
            <div>
              {isLoading && <div>Загрузка данных...</div>}
              {!isLoading && selectedSubjectIds
                .map(subjectId => {
                  const students = subjectStudentsMap[subjectId] || [];
                  const filteredStudents = selectedClassIds.length > 0
                    ? students.filter(student =>
                        selectedClassIds.some(classId => 
                          `class-${student.grade}${student.index}` === classId
                        )
                      )
                    : students;
                  
                  return filteredStudents.length > 0 
                    ? renderStudentsList(subjectId, students)
                    : null;
                })
                .filter(Boolean)
              }
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
        availableSubjects={availableSubjects}
        availableClasses={availableClasses}
      />
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default TeacherDashboard;