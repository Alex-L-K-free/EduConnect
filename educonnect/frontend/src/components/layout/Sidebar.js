import React, { useState, useEffect } from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar
import educonnectLogo from '../../assets/images/educonnect-logo.png';
import LoginModal from '../LoginModal';
import api from '../../utils/axios';

const Sidebar = ({ activePage }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [stats, setStats] = useState({
    studentsCount: '500+',
    materialsCount: '1000+'
  });

  useEffect(() => {
    // Загружаем статистику при монтировании компонента
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/v1/platform-stats/');
      setStats({
        studentsCount: response.data.students_count > 500 ? '500+' : response.data.students_count + '+',
        materialsCount: response.data.materials_count > 1000 ? '1000+' : response.data.materials_count + '+'
      });
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
      // В случае ошибки оставляем дефолтные значения
    }
  };

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
          <span className="stat-value">{stats.studentsCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Учебных материалов</span>
          <span className="stat-value">{stats.materialsCount}</span>
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