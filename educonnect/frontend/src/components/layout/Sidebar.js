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

      {/* <div className="info-section">
        <div className="info-block">
          <h3>Для учеников</h3>
          <ul>
            <li>Доступ к учебным материалам</li>
            <li>Общение с одноклассниками</li>
            <li>Отслеживание успеваемости</li>
          </ul>
        </div>

        <div className="info-block">
          <h3>Для учителей</h3>
          <ul>
            <li>Управление материалами</li>
            <li>Работа с учениками</li>
            <li>Ведение успеваемости</li>
          </ul>
        </div>
      </div> */}

      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">Учеников на платформе</span>
          <span className="stat-value">500+</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Учебных материалов</span>
          <span className="stat-value">1000+</span>
        </div>
      </div>

      <LoginModal 
        show={showLogin} 
        onHide={handleClose}
      />
    </div>
  );
};

export default Sidebar; 