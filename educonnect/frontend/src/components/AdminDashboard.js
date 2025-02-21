import React from 'react';
import SidebarAdmin from './layout/SidebarAdmin';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <SidebarAdmin activePage="admin" />
      <h6>Панель управления администратора</h6>
      {/* Добавьте функционал для панели администратора */}
    </div>
  );
};

export default AdminDashboard; 