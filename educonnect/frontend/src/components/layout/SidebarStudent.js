import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const SidebarStudent = ({ activePage }) => {
  const navigate = useNavigate();

  const handleMainClick = () => {
    navigate('/student');
  };

  return (
    <div className="sidebar" style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <h2>ученик</h2>
      <ul className="sidebar-nav">
        <li 
          className={activePage === 'student' ? 'active' : ''}
          onClick={handleMainClick}
        >
          <span className="menu-icon">🏠</span>
          <span className="menu-text">Главная</span>
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