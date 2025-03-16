import React, { useState, useEffect } from 'react';
import SidebarTeacher from './layout/SidebarTeacher';
import TeacherProfile from './forms/teachers/TeacherProfile';
import TeacherSubjects from './forms/subjects/SubjectsList';
import StudentsList from './forms/students/StudentsList';

const TeacherDashboard = () => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const handleNavigate = (view) => {
    // Проверяем, если это переход к ученикам по предмету
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
          <div>
            <h3>Список учеников по предмету</h3>
            <StudentsList 
              key={selectedSubjectId} // Для принудительного обновления при смене предмета
              filterBySubject={selectedSubjectId} 
            />
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