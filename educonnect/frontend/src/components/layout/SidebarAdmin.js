import React from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar

const SidebarAdmin = ({ activePage }) => {
  return (
    <div className="sidebar">
      <h2>Навигация администратора</h2>
      <ul>
        <li className={activePage === 'admin' ? 'active' : ''}>
          <a href="/admin">Панель управления</a>
        </li>
        {/* Добавьте другие элементы навигации для администратора */}
      </ul>
    </div>
  );
};

export default SidebarAdmin; 