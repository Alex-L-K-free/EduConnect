import React from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar

const Sidebar = ({ activePage }) => {
  return (
    <div className="sidebar">
      <h2>Навигация</h2>
      <ul>
        <li className={activePage === 'home' ? 'active' : ''}>
          <a href="/">Главная</a>
        </li>
        <li className={activePage === 'admin' ? 'active' : ''}>
          <a href="/admin">Панель управления</a>
        </li>
        <li className={activePage === 'teacher' ? 'active' : ''}>
          <a href="/teacher">Панель учителя</a>
        </li>
        <li className={activePage === 'student' ? 'active' : ''}>
          <a href="/student">Панель ученика</a>
        </li>
        {/* Добавьте другие элементы навигации по мере необходимости */}
      </ul>
    </div>
  );
};

export default Sidebar; 