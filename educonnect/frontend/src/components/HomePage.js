import React from 'react';
import backgroundImage from '../assets/images/background.jpg';
import './HomePage.css';
// import './Sidebar.css'; // Импортируйте стили для Sidebar
// import Sidebar from './layout/Sidebar';
// import eduConnectLogo from '../assets/images/educonnect-logo.png';

const HomePage = () => {
  return (
    <div className="home-page">
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

export default HomePage; 