import React, { useState } from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar
import educonnectLogo from '../../assets/images/educonnect-logo.png';
import LoginModal from '../LoginModal';

const Sidebar = ({ activePage }) => {
  const [showLogin, setShowLogin] = useState(false);

  const handleShow = () => setShowLogin(true);
  const handleClose = () => setShowLogin(false);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleShow();
    }
  };

  return (
    <div className="sidebar">
      <div 
        className="sidebar-header clickable"
        onClick={handleShow}
        onKeyPress={handleKeyPress}
        role="button"
        tabIndex={0}
        aria-label="Открыть форму входа"
      >
        <img 
          src={educonnectLogo} 
          alt="EduConnect" 
          className="sidebar-logo"
        />
      </div>
      <div 
        className="registration-warning clickable"
        onClick={handleShow}
        onKeyPress={handleKeyPress}
        role="button"
        tabIndex={0}
        aria-label="Войти или зарегистрироваться"
      >
        <h6>Необходимо войти или зарегистрироваться для продолжения!</h6>
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

      <LoginModal 
        show={showLogin} 
        onHide={handleClose}
      />
    </div>
  );
};

export default Sidebar; 