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
        {/* Удалите другие элементы, если они не нужны на главной странице */}
      </ul>
    </div>
  );
};

export default Sidebar; 