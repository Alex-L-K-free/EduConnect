import React, { useState, useEffect } from 'react';
import SidebarTeacher from './layout/SidebarTeacher';
import TeacherProfile from './forms/teachers/TeacherProfile';
import TeacherSubjects from './forms/subjects/SubjectsList';
import StudentsList from './forms/students/StudentsList';
import StudentActions, { MaterialCell, DescriptionCell, MessageCell } from './forms/teachers/TeacherActions';
import { useUser } from '../UserContext';
import axios from 'axios';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user } = useUser();

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

  // Добавляем новые состояния для статистики
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    studentsPerSubject: {},
    studentsPerClass: {},
    materialsCount: 0,
    tasksCount: 0,
    messagesCount: 0
  });

  const handleMaterialsUpdate = async (update, forceUpdate = false) => {
    // Если передан forceUpdate или нет конкретного update
    if (forceUpdate || !update) {
      const selectedIds = Object.keys(selectedStudents)
        .filter(id => selectedStudents[id])
        .map(id => parseInt(id));

      if (selectedIds.length > 0) {
        try {
          const response = await axios.get('/api/v1/materials/students/', {
            headers: {
              'Authorization': `Token ${localStorage.getItem('token')}`
            },
            params: {
              student_ids: selectedIds.join(',')
            }
          });

          // Обновляем оба представления
          if (currentView === 'students-by-subjects') {
            setSubjectStudentsMap(prevMap => {
              const newMap = { ...prevMap };
              Object.keys(newMap).forEach(subjectId => {
                newMap[subjectId] = newMap[subjectId].map(student => {
                  const updatedData = response.data.find(data => data.id === student.id);
                  if (updatedData) {
                    return {
                      ...student,
                      materials: updatedData.materials
                    };
                  }
                  return student;
                });
              });
              return newMap;
            });
          } else if (currentView === 'students-by-classes') {
            setClassStudentsMap(prevMap => {
              const newMap = { ...prevMap };
              Object.keys(newMap).forEach(classId => {
                newMap[classId] = newMap[classId].map(student => {
                  const updatedData = response.data.find(data => data.id === student.id);
                  if (updatedData) {
                    return {
                      ...student,
                      materials: updatedData.materials
                    };
                  }
                  return student;
                });
              });
              return newMap;
            });
          }
        } catch (error) {
          console.error('Ошибка при обновлении материалов:', error);
        }
      }
      return;
    }

    // Существующая логика обновления для одного студента
    const { studentId, materials } = update;

    if (currentView === 'students-by-subjects') {
      setSubjectStudentsMap(prevMap => {
        const newMap = { ...prevMap };
        Object.keys(newMap).forEach(subjectId => {
          newMap[subjectId] = newMap[subjectId].map(student => {
            if (student.id === studentId) {
              return {
                ...student,
                materials: materials
              };
            }
            return student;
          });
        });
        return newMap;
      });
    } else if (currentView === 'students-by-classes') {
      setClassStudentsMap(prevMap => {
        const newMap = { ...prevMap };
        Object.keys(newMap).forEach(classId => {
          newMap[classId] = newMap[classId].map(student => {
            if (student.id === studentId) {
              return {
                ...student,
                materials: materials
              };
            }
            return student;
          });
        });
        return newMap;
      });
    }
  };

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
        
        const studentsData = response.data.filter(student => 
          student.username && student.username !== 'Не зарегистрирован'
        );

        // Загружаем материалы для каждого студента
        const studentsWithMaterials = await Promise.all(
          studentsData.map(async (student) => {
            try {
              const materialsResponse = await axios.get(`/api/v1/materials/student/${student.id}/`, {
                headers: {
                  'Authorization': `Token ${localStorage.getItem('token')}`
                }
              });
              return {
                ...student,
                materials: materialsResponse.data
              };
            } catch (error) {
              console.error(`Ошибка при загрузке материалов для студента ${student.id}:`, error);
              return student;
            }
          })
        );

        // Обновляем студентов с материалами
        if (shouldFetchBySubjects) {
          const newStudentsBySubject = {};
          selectedSubjectIds.forEach(subjectId => {
            const subject = subjectsData[subjectId];
            if (subject) {
              newStudentsBySubject[subjectId] = studentsWithMaterials.filter(student => 
                student.subject === subject.name
              );
            }
          });
          setSubjectStudentsMap(newStudentsBySubject);
        }

        if (shouldFetchByClasses) {
          const newStudentsByClass = {};
          selectedClassIds.forEach(classId => {
            newStudentsByClass[classId] = studentsWithMaterials.filter(student =>
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

    // Фильтруем и группируем студентов
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
        <div className="section-header">
          <h3>Предмет: {subjectName}</h3>
        </div>
        {sortedClasses.map(classKey => (
          <div key={`${subjectId}-${classKey}`} className="class-section">
            <div className="class-header">
              <h4>Класс: {classKey}</h4>
            </div>
            <table className="students-table">
              <colgroup>
                <col className="checkbox-cell" />
                <col className="student-name-column" />
                <col className="student-actions-column" />
                <col className="student-actions-column" />
                <col className="student-actions-column" />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="student-checkbox"
                      checked={studentsByClass[classKey].every(student => selectedStudents[student.id])}
                      onChange={() => handleSelectAllStudents(classKey, studentsByClass[classKey])}
                    />
                  </th>
                  <th>Ученик</th>
                  <th>
                    <StudentActions 
                      students={studentsByClass[classKey]}
                      selectedStudents={selectedStudents}
                      onMaterialsUpdate={handleMaterialsUpdate}
                      type="materials"
                    />
                  </th>
                  <th>
                    <StudentActions 
                      students={studentsByClass[classKey]}
                      selectedStudents={selectedStudents}
                      onMaterialsUpdate={handleMaterialsUpdate}
                      type="tasks"
                    />
                  </th>
                  <th>
                    <StudentActions 
                      students={studentsByClass[classKey]}
                      selectedStudents={selectedStudents}
                      onMaterialsUpdate={handleMaterialsUpdate}
                      type="messages"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentsByClass[classKey].map(student => {
                  const updatedStudent = students.find(s => s.id === student.id) || student;
                  return (
                    <tr 
                      key={student.id}
                      className={selectedStudents[student.id] ? 'selected-row' : ''}
                    >
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          className="student-checkbox"
                          checked={selectedStudents[student.id] || false}
                          onChange={() => handleSelectStudent(student.id)}
                        />
                      </td>
                      <td className="student-name-column">
                        {`${student.lastName} ${student.firstName} ${student.middleName || ''}`}
                      </td>
                      <MaterialCell 
                        materials={updatedStudent.materials || []} 
                        onMaterialsUpdate={handleMaterialsUpdate}
                        studentId={student.id}
                      />
                      <DescriptionCell descriptions={updatedStudent.descriptions || []} />
                      <MessageCell messages={updatedStudent.messages || []} />
                    </tr>
                  );
                })}
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

  // Функция для получения статистики
  const fetchStatistics = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Получаем всех студентов
      const studentsResponse = await axios.get('/api/v1/students/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      const students = studentsResponse.data;

      // Получаем все предметы
      const subjectsResponse = await axios.get('/api/v1/subjects/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      const subjects = subjectsResponse.data;

      // Подсчитываем статистику
      const stats = {
        totalStudents: students.length,
        totalSubjects: new Set(students.map(s => s.subject)).size,
        studentsPerSubject: {},
        studentsPerClass: {},
        materialsCount: 0,
        tasksCount: 0,
        messagesCount: 0
      };

      // Подсчет студентов по предметам
      students.forEach(student => {
        if (student.subject) {
          stats.studentsPerSubject[student.subject] = (stats.studentsPerSubject[student.subject] || 0) + 1;
        }

        const classKey = `${student.grade}${student.index}`;
        stats.studentsPerClass[classKey] = (stats.studentsPerClass[classKey] || 0) + 1;

        // Подсчитываем материалы, если они есть
        if (student.materials) {
          stats.materialsCount += student.materials.filter(m => m.material_type === 'document').length;
          stats.tasksCount += student.materials.filter(m => m.material_type === 'task').length;
          stats.messagesCount += student.materials.filter(m => m.material_type === 'message').length;
        }
      });

      setStatistics(stats);

    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
    }
  };

  // Загружаем статистику при монтировании и при изменении view на main
  useEffect(() => {
    if (currentView === 'main') {
      fetchStatistics();
    }
  }, [currentView]);

  const renderMainDashboard = () => {
    return (
      <div className="main-dashboard">
        <h2>Панель управления</h2>
        
        <div className="dashboard-stats">
          <div className="stats-card total-students">
            <h3>Всего учеников</h3>
            <div className="stats-number">{statistics.totalStudents}</div>
          </div>
          
          <div className="stats-card total-subjects">
            <h3>Всего предметов</h3>
            <div className="stats-number">{statistics.totalSubjects}</div>
          </div>

          <div className="stats-card total-materials">
            <h3>Материалы</h3>
            <div className="stats-details">
              <div>Документы: {statistics.materialsCount}</div>
              <div>Задания: {statistics.tasksCount}</div>
              <div>Сообщения: {statistics.messagesCount}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-details">
          <div className="subjects-distribution">
            <h3>Распределение по предметам</h3>
            <div className="distribution-list">
              {Object.entries(statistics.studentsPerSubject).map(([subject, count]) => (
                <div key={subject} className="distribution-item">
                  <span className="subject-name">{subject}</span>
                  <span className="student-count">{count} учеников</span>
                </div>
              ))}
            </div>
          </div>

          <div className="classes-distribution">
            <h3>Распределение по классам</h3>
            <div className="distribution-list">
              {Object.entries(statistics.studentsPerClass)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([classKey, count]) => (
                  <div key={classKey} className="distribution-item">
                    <span className="class-name">{classKey}</span>
                    <span className="student-count">{count} учеников</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'main':
        return renderMainDashboard();
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