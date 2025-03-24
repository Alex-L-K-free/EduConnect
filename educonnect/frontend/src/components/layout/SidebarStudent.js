import React from 'react';
import './Sidebar.css';

const SidebarStudent = ({ activePage }) => {
  return (
    <div className="sidebar">
      <h2>ученик</h2>
      <ul>
        <li className={activePage === 'home' ? 'active' : ''}>
          <a href="/">Главная</a>
        </li>
        {/* Закомментированные пункты меню 
        <li className={activePage === 'admin' ? 'active' : ''}>
          <a href="/admin">Панель управления</a>
        </li>
        <li className={activePage === 'teacher' ? 'active' : ''}>
          <a href="/teacher">учителя</a>
        </li>
        <li className={activePage === 'student' ? 'active' : ''}>
          <a href="/student">ученика</a>
        </li>
        */}
      </ul>
    </div>
  );
};

export default SidebarStudent;