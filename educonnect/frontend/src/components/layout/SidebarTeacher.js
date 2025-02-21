import React from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar

const SidebarTeacher = ({ activePage }) => {
  return (
    <div className="sidebar">
      <h2>Навигация учителя</h2>
      <ul>
        <li className={activePage === 'teacher' ? 'active' : ''}>
          <a href="/teacher">Панель учителя</a>
        </li>
        {/* Добавьте другие элементы навигации для учителя */}
      </ul>
    </div>
  );
};

export default SidebarTeacher; 