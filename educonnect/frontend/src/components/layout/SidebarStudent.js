import React from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar

const SidebarStudent = ({ activePage }) => {
  return (
    <div className="sidebar">
      <h2>Навигация ученика</h2>
      <ul>
        <li className={activePage === 'student' ? 'active' : ''}>
          <a href="/student">Панель ученика</a>
        </li>
        {/* Добавьте другие элементы навигации для ученика */}
      </ul>
    </div>
  );
};

export default SidebarStudent; 