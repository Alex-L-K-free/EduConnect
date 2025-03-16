import React from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar
import educonnectLogo from '../../assets/images/educonnect-logo.png';

const Sidebar = ({ activePage }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img 
          src={educonnectLogo} 
          alt="EduConnect" 
          className="sidebar-logo"
        />
      </div>
      <div className="registration-warning">
       <h6> Необходимо войти или зарегистрироваться для продолжения!</h6>
      </div>
      {/* <h2>главная</h2>
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
      </ul> */}
    </div>
  );
};

export default Sidebar; 