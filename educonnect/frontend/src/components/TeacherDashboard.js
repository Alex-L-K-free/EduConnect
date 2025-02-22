import React from 'react';
import SidebarTeacher from './layout/SidebarTeacher';

const TeacherDashboard = () => {
  return (
    <div className="teacher-dashboard">
      <SidebarTeacher activePage="teacher" />
      <h1>Панель управления учителя</h1>
      {/* Добавьте функционал для панели учителя */}
    </div>
  );
};

export default TeacherDashboard; 