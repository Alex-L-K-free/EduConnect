import React, { useEffect } from 'react';
import backgroundImage from '../assets/images/background.jpg';
import './HomePage.css';
// import './Sidebar.css'; // Импортируйте стили для Sidebar
import Sidebar from './layout/Sidebar';
// import eduConnectLogo from '../assets/images/educonnect-logo.png';
import api from '../utils/axios';

const HomePage = () => {
  useEffect(() => {
    // Проверка доступности API при загрузке страницы
    const checkApiStatus = async () => {
      try {
        await api.get('/api/v1/platform-stats/');
        console.log('API подключен и работает');
      } catch (error) {
        console.error('Ошибка при подключении к API:', error);
      }
    };
    
    checkApiStatus();
  }, []);

  return (
    <div className="home-page">
      <Sidebar />
      <div className="background-image" 
        style={{ backgroundImage: `url(${backgroundImage})` }} 
      />
      <div className="content">
        <div className="content-box">
          <h1>Добро пожаловать в образовательную платформу</h1>
          <h1>EduConnect</h1>
          <h2>Платформа предоставляет:</h2>
          <ul>
            <li>Удобный доступ к учебным материалам</li>
            <li>Взаимодействие между учителем и учениками</li>
            {/* <li>Управление учебным процессом</li> */}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Изменение масштаба при изменении размера окна
window.addEventListener('resize', () => {
  const scaleFactor = 1 / window.devicePixelRatio;
  document.documentElement.style.setProperty('--scale-factor', scaleFactor);
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const scaleFactor = 1 / window.devicePixelRatio;
  document.documentElement.style.setProperty('--scale-factor', scaleFactor);
});

export default HomePage;