import React from 'react';
// import './Sidebar.css'; // Импортируйте стили для Sidebar
import Sidebar from './layout/Sidebar';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Добро пожаловать на главную страницу</h1>
      <Sidebar activePage="home" />
      {/* Добавьте функционал для главной страницы */}
    </div>
  );
};

export default HomePage; 