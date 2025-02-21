import React from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar

const SidebarAdmin = ({ activePage }) => {
  return (
    <div className="sidebar">
      <h6>Администратор</h6>
      <ul>
        <li className={activePage === 'home' ? 'active' : ''}>
          <a href="/">Главная</a>
        </li>
        <li className={activePage === 'teacher' ? 'active' : ''}>
          <a href="/teacher">Учитель</a>
        </li>
        <li className={activePage === 'student' ? 'active' : ''}>
          <a href="/student">Ученик</a>
        </li>
        <li className={activePage === 'subject' ? 'active' : ''}>
          <a href="/subject">Предметы</a>
        </li>
         {/* Добавьте другие элементы навигации для ученика */}
      </ul>
    </div>
  );
};

export default SidebarAdmin; 