import React from 'react';
// import './Sidebar.css'; // Импортируйте стили для Sidebar
import Sidebar from './layout/Sidebar';

const HomePage = () => {
  return (
    <div className="home-page">
      <Sidebar activePage="home" />
      <div className="main-content">
        {/* <h1>Добро пожаловать на главную страницу</h1> */}
        {/* Добавьте функционал для главной страницы */}
      </div>
    </div>
  );
};

export default HomePage; 