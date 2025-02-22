import React, { useState } from 'react';
import SidebarAdmin from './layout/SidebarAdmin';
import TeacherRegistrationForm from './forms/TeacherRegistrationForm';
// import '../styles/components/AdminDashboard.css';

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('main');

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'teacher':
        return <TeacherRegistrationForm />;
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