import React from 'react';
import backgroundImage from '../assets/images/background.jpg';
import './HomePage.css';
// import './Sidebar.css'; // Импортируйте стили для Sidebar
// import Sidebar from './layout/Sidebar';

const HomePage = () => {
  return (
    <div className="home-page" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))',
      color: '#fff',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <div className="content-wrapper">
        <h1>Добро пожаловать в образовательную платформу</h1>
        <h2>Платформа предоставляет:</h2>
        <ul>
          <li>Удобный доступ к учебным материалам</li>
          <li>Взаимодействие между учителем и учениками</li>
          <li>Управление учебным процессом</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage; 