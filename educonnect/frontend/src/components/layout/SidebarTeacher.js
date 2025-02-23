import React from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar

const SidebarTeacher = ({ activePage, onNavigate }) => {
  return (
    <div className="sidebar">
      <h2>Учитель</h2>
      <ul>
        <li 
          className={activePage === 'main' ? 'active' : ''}
          onClick={() => onNavigate('main')}
        >
          <a href="#!">Главная</a>
        </li>
        <li 
          className={activePage === 'profile' ? 'active' : ''}
          onClick={() => onNavigate('profile')}
        >
          <a href="#!">Мой профиль</a>
        </li>
        {/* <li className={activePage === 'teacher' ? 'active' : ''}>
          <a href="/teacher">учителя</a>
        </li>
        <li className={activePage === 'student' ? 'active' : ''}>
          <a href="/student">ученика</a>
        </li> */}
         {/* Добавьте другие элементы навигации для ученика */}
      </ul>
    </div>
  );
};

export default SidebarTeacher; 