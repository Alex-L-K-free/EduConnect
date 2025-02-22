import React, { useState, useEffect } from 'react';
import SidebarAdmin from './layout/SidebarAdmin';
import TeacherRegistrationForm from './forms/teachers/TeacherRegistrationForm';
import TeachersList from './forms/teachers/TeachersListAdmin';
// import '../styles/components/AdminDashboard.css';

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('main');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [teachers, setTeachers] = useState([]);

  // Загрузка списка учителей
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/v1/teachers/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      } else {
        console.error('Failed to fetch teachers');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  useEffect(() => {
    if (currentView === 'teacher') {
      fetchTeachers();
    }
  }, [currentView]);

  const handleNavigate = (view) => {
    setCurrentView(view);
    setShowRegistrationForm(false);
  };

  const handleAddTeacher = () => {
    setShowRegistrationForm(true);
  };

  const handleTeacherAdded = (newTeacher) => {
    setTeachers([...teachers, newTeacher]);
    setShowRegistrationForm(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'teacher':
        return showRegistrationForm ? (
          <TeacherRegistrationForm onSuccess={handleTeacherAdded} />
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