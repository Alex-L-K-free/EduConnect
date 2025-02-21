import React from 'react';
import SidebarStudent from './layout/SidebarStudent';

const StudentDashboard = () => {
  return (
    <div className="student-dashboard">
      <SidebarStudent activePage="student" />
      <h1>Панель управления ученика</h1>
      {/* Добавьте функционал для панели ученика */}
    </div>
  );
};

export default StudentDashboard; 