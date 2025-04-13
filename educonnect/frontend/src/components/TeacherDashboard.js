import React, { useState, useEffect } from 'react';
import SidebarTeacher from './layout/SidebarTeacher';
import TeacherProfile from './forms/teachers/TeacherProfile';
import TeacherSubjects from './forms/subjects/SubjectsList';
import StudentsList from './forms/students/StudentsList';
// Временно закомментированные импорты
// import StudentActions, { MaterialCell } from './forms/teachers/TeacherActions';
import axios from 'axios';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
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

  const [isLoading, setIsLoading] = useState(false);

  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  const [selectedStudents, setSelectedStudents] = useState({});

  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    registeredStudents: 0,
    totalSubjects: 0,
    studentsPerSubject: {},
    studentsPerClass: {},
    materialsCount: 0,
    tasksCount: 0,
    messagesCount: 0
  });

  const [expandedStudents, setExpandedStudents] = useState({});

  const handleMaterialsUpdate = async (update, forceUpdate = false) => {
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

  const toggleStudentMaterials = (studentId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  useEffect(() => {
    localStorage.setItem('teacherDashboardView', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('teacherSelectedSubjects', JSON.stringify(selectedSubjectIds));
  }, [selectedSubjectIds]);

  useEffect(() => {
    localStorage.setItem('teacherSelectedClasses', JSON.stringify(selectedClassIds));
  }, [selectedClassIds]);

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
  }, [subjectsData]);

  useEffect(() => {
    const fetchStudents = async () => {
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

        const materialsPromises = studentsData.map(async (student) => {
          try {
            const subject = student.subject.toLowerCase().trim();
            const materialsResponse = await axios.get(`/api/v1/materials/student/${student.id}/`, {
              headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
              },
              params: {
                subject: subject
              }
            });
            
            return {
              ...student,
              materials: materialsResponse.data.filter(
                material => material.subject_name.toLowerCase().trim() === subject
              )
            };
          } catch (error) {
            console.error(`Ошибка при загрузке материалов для студента ${student.id}:`, error);
            return {
              ...student,
              materials: []
            };
          }
        });

        const studentsWithMaterials = await Promise.all(materialsPromises);

        if (shouldFetchBySubjects) {
          const newStudentsBySubject = {};
          selectedSubjectIds.forEach(subjectId => {
            const subject = subjectsData[subjectId];
            if (subject) {
              newStudentsBySubject[subjectId] = studentsWithMaterials.filter(
                student => student.subject.toLowerCase().trim() === subject.name.toLowerCase().trim()
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
        console.error('Ошибка при загрузке учеников:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSubjectIds, selectedClassIds, subjectsData, currentView]);

  useEffect(() => {
    return () => {
      setSubjectStudentsMap({});
      setClassStudentsMap({});
    };
  }, []);

  useEffect(() => {
    if (!subjectStudentsMap || !classStudentsMap) return;

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

  const sortStudents = (students) => {
    return [...students].sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });
  };

  const handleDownloadMaterial = async (material) => {
    try {
      const link = document.createElement('a');
      link.href = material.file_url;
      link.setAttribute('download', material.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading material:', error);
    }
  };

  const renderSubjectMaterials = (subjectDetails) => {
    // Разделяем материалы на учительские и студенческие
    const teacherMaterials = subjectDetails.materials.filter(m => !m.is_student_material);
    const studentMaterials = subjectDetails.materials.filter(m => m.is_student_material);

    return (
      <div className="subject-materials">
        <div className="materials-grid">
          {/* Материалы от учителя */}
          <div className="teacher-materials">
            <div className="materials-header">
              <h4>Материал учителя</h4>
            </div>
            {teacherMaterials.length > 0 ? (
              <div className="materials-list">
                {teacherMaterials.map((material) => (
                  <div key={material.id} className="material-item">
                    <div className="material-header">
                      <h5>{material.title}</h5>
                      <span className="material-date">{material.formatted_date}</span>
                    </div>
                    <p>{material.description}</p>
                    <div className="material-actions">
                      <button 
                        onClick={() => handleDownloadMaterial(material)}
                        className="material-action-btn download-btn"
                      >
                        <span>📥</span>
                        <span>Скачать</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Нет материалов от учителя</p>
            )}
          </div>

          {/* Материалы ученика */}
          <div className="student-materials">
            <div className="materials-header">
              <h4>Материал ученика</h4>
            </div>
            {studentMaterials.length > 0 ? (
              <div className="materials-list">
                {studentMaterials.map((material) => (
                  <div key={material.id} className="material-item student-material">
                    <div className="material-header">
                      <h5>{material.title}</h5>
                      <span className="material-date">{material.formatted_date}</span>
                    </div>
                    <p>{material.description}</p>
                    <div className="material-actions">
                      <button 
                        onClick={() => handleDownloadMaterial(material)}
                        className="material-action-btn download-btn"
                      >
                        <span>📥</span>
                        <span>Скачать</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>У ученика пока нет загруженных материалов</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStudentsList = (subjectId, students) => {
    const subjectName = subjectsData[subjectId]?.name || '';
    
    if (isLoading) {
      return <div>Загрузка учеников...</div>;
    }

    let filteredStudents = students;
    if (selectedClassIds.length > 0) {
      filteredStudents = students.filter(student =>
        selectedClassIds.some(classId => 
          `class-${student.grade}${student.index}` === classId
        )
      );
    }

    const studentsByClass = {};
    filteredStudents.forEach(student => {
      const classKey = `${student.grade}${student.index || ''}`;
      if (!studentsByClass[classKey]) {
        studentsByClass[classKey] = [];
      }
      studentsByClass[classKey].push(student);
    });

    Object.keys(studentsByClass).forEach(classKey => {
      studentsByClass[classKey] = sortStudents(studentsByClass[classKey]);
    });

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
                <col className="student-materials-column" />
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
                  <th>Материалы</th>
                </tr>
              </thead>
              <tbody>
                {studentsByClass[classKey].map(student => {
                  const updatedStudent = students.find(s => s.id === student.id) || student;
                  const teacherMaterialsCount = updatedStudent.materials?.filter(m => !m.is_student_material).length || 0;
                  const studentMaterialsCount = updatedStudent.materials?.filter(m => m.is_student_material).length || 0;
                  
                  return (
                    <React.Fragment key={student.id}>
                      <tr className={selectedStudents[student.id] ? 'selected-row' : ''}>
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
                        <td className="materials-summary">
                          <button 
                            className="toggle-materials-btn"
                            onClick={() => toggleStudentMaterials(student.id)}
                          >
                            <span>📚 Материалы учителя: {teacherMaterialsCount}</span>
                            <span>📝 Материалы ученика: {studentMaterialsCount}</span>
                            {expandedStudents[student.id] ? '▼' : '▶'}
                          </button>
                        </td>
                      </tr>
                      {expandedStudents[student.id] && (
                        <tr className="materials-row">
                          <td colSpan="3">
                            <div className="subject-materials">
                              <div className="materials-grid">
                                {/* Материалы от учителя */}
                                <div className="teacher-materials">
                                  <div className="materials-header">
                                    <h4>Материал учителя</h4>
                                  </div>
                                  {updatedStudent.materials?.filter(m => !m.is_student_material).length > 0 ? (
                                    <div className="materials-list">
                                      {updatedStudent.materials
                                        .filter(m => !m.is_student_material)
                                        .map((material) => (
                                          <div key={material.id} className="material-item">
                                            <div className="material-header">
                                              <h5>{material.title}</h5>
                                              <span className="material-date">{material.formatted_date}</span>
                                            </div>
                                            <p>{material.description}</p>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p>Нет материалов от учителя</p>
                                  )}
                                </div>

                                {/* Материалы ученика */}
                                <div className="student-materials">
                                  <div className="materials-header">
                                    <h4>Материал ученика</h4>
                                  </div>
                                  {updatedStudent.materials?.filter(m => m.is_student_material).length > 0 ? (
                                    <div className="materials-list">
                                      {updatedStudent.materials
                                        .filter(m => m.is_student_material)
                                        .map((material) => (
                                          <div key={material.id} className="material-item student-material">
                                            <div className="material-header">
                                              <h5>{material.title}</h5>
                                              <span className="material-date">{material.formatted_date}</span>
                                            </div>
                                            <p>{material.description}</p>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p>У ученика пока нет загруженных материалов</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

  const fetchStatistics = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const studentsResponse = await axios.get('/api/v1/students/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      const students = studentsResponse.data;

      const materialsResponse = await axios.get('/api/v1/materials/students/', {
        headers: {
          'Authorization': `Token ${token}`
        },
        params: {
          student_ids: students.map(s => s.id).join(',')
        }
      });

      const stats = {
        totalStudents: students.length,
        registeredStudents: students.filter(student => 
          student.username && 
          student.username !== 'Не зарегистрирован' && 
          student.username.trim() !== ''
        ).length,
        totalSubjects: new Set(students.map(s => s.subject)).size,
        studentsPerSubject: {},
        studentsPerClass: {},
        materialsCount: 0,
        tasksCount: 0,
        messagesCount: 0
      };

      students.forEach(student => {
        if (student.subject) {
          stats.studentsPerSubject[student.subject] = (stats.studentsPerSubject[student.subject] || 0) + 1;
        }

        const classKey = `${student.grade}${student.index}`;
        stats.studentsPerClass[classKey] = (stats.studentsPerClass[classKey] || 0) + 1;

        const studentMaterials = materialsResponse.data.find(m => m.id === student.id)?.materials || [];
        
        studentMaterials.forEach(material => {
          if (material.material_type === 'document') {
            stats.materialsCount++;
          } else if (material.material_type === 'task') {
            stats.tasksCount++;
          } else if (material.material_type === 'message') {
            stats.messagesCount++;
          }
        });
      });

      setStatistics(stats);

    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
    }
  };

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
            <h3>Материал</h3>
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