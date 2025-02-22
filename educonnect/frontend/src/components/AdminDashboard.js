import React, { useState } from 'react';
import SidebarAdmin from './layout/SidebarAdmin';
import TeacherRegistrationForm from './forms/teachers/TeacherRegistrationForm';
import TeachersList from './forms/teachers/TeachersList';
// import '../styles/components/AdminDashboard.css';

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('main');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [teachers, setTeachers] = useState([
    // Временные данные для примера
    { id: 1, username: 'teacher1', firstName: 'Иван', lastName: 'Петров' },
    { id: 2, username: 'teacher2', firstName: 'Мария', lastName: 'Иванова' },
  ]);

  const handleNavigate = (view) => {
    setCurrentView(view);
    setShowRegistrationForm(false);
  };

  const handleAddTeacher = () => {
    setShowRegistrationForm(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'teacher':
        return showRegistrationForm ? (
          <TeacherRegistrationForm 
            onSuccess={(newTeacher) => {
              setTeachers([...teachers, newTeacher]);
              setShowRegistrationForm(false);
            }}
          />
        ) : (
          <TeachersList 
            teachers={teachers} 
            onAddTeacher={handleAddTeacher}
          />
        );
      default:
        return <h6>Панель управления администратора</h6>;
    }
  };

  return (
    <div className="admin-dashboard">
      <SidebarAdmin activePage={currentView} onNavigate={handleNavigate} />
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 