import React, { useState } from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar

const SidebarTeacher = ({ activePage, onNavigate }) => {
  const [isCabinetOpen, setIsCabinetOpen] = useState(false);

  const handleMainClick = () => {
    setIsCabinetOpen(false); // Закрываем подменю
    onNavigate('main');
  };

  const toggleCabinet = () => {
    setIsCabinetOpen(!isCabinetOpen);
  };

  const handleSubmenuClick = (page, e) => {
    e.stopPropagation();
    onNavigate(page);
  };

  return (
    <div className="sidebar">
      {/* <h2>Учитель</h2> */}
      <ul>
        <li 
          className={activePage === 'main' ? 'active' : ''}
          onClick={handleMainClick}
        >
          <a href="#!">Главная</a>
        </li>
        
        <li 
          className={`cabinet-item ${isCabinetOpen ? 'open' : ''} ${
            ['profile', 'subjects', 'cabinet'].includes(activePage) ? 'active' : ''
          }`}
          onClick={toggleCabinet}
        >
          <a href="#!">
            Мой кабинет
            <span className={`arrow ${isCabinetOpen ? 'down' : 'right'}`}>▸</span>
          </a>
          
          {isCabinetOpen && (
            <ul className="submenu">
              <li 
                className={activePage === 'profile' ? 'active' : ''}
                onClick={(e) => handleSubmenuClick('profile', e)}
              >
                <a href="#!">Мой профиль</a>
              </li>
              <li 
                className={activePage === 'subjects' ? 'active' : ''}
                onClick={(e) => handleSubmenuClick('subjects', e)}
              >
                <a href="#!">Мои предметы</a>
              </li>
            </ul>
          )}
        </li>
        {/* <li className={activePage === 'student' ? 'active' : ''}>
          <a href="/student">ученика</a>
        </li> */}
         {/* Добавьте другие элементы навигации для ученика */}
      </ul>
    </div>
  );
};

export default SidebarTeacher; 