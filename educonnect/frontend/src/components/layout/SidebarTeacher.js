import React, { useState } from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar

const SidebarTeacher = ({ activePage, onNavigate }) => {
  const [isCabinetOpen, setIsCabinetOpen] = useState(false);

  const handleMainClick = () => {
    setIsCabinetOpen(false); // Закрываем подменю
    onNavigate('main');
  };

  const handleMenuClick = (page) => {
    onNavigate(page);
  };

  const menuItems = [
    {
      id: 'subjects',
      label: 'Предметы',
      icon: '📚'
    },
    {
      id: 'classes',
      label: 'Классы',
      icon: '👥'
    },
    {
      id: 'students',
      label: 'Ученики',
      icon: '🎓'
    },
    {
      id: 'materials',
      label: 'Материалы',
      icon: '📝'
    },
    {
      id: 'messages',
      label: 'Сообщения',
      icon: '✉️'
    },
    {
      id: 'notifications',
      label: 'Уведомления',
      icon: '🔔'
    }
  ];

  return (
    <div className="sidebar">
      {/* <h2>Учитель</h2> */}
      <ul>
        <li 
          className={activePage === 'main' ? 'active' : ''}
          onClick={handleMainClick}
        >
          <span className="menu-icon">🏠</span>
          <span className="menu-text">Главная</span>
        </li>
        
        {menuItems.map(item => (
          <li 
            key={item.id}
            className={activePage === item.id ? 'active' : ''}
            onClick={() => handleMenuClick(item.id)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-text">{item.label}</span>
          </li>
        ))}

        <li 
          className={`cabinet-item ${isCabinetOpen ? 'open' : ''} ${
            ['profile'].includes(activePage) ? 'active' : ''
          }`}
          onClick={() => handleMenuClick('profile')}
        >
          <span className="menu-icon">👤</span>
          <span className="menu-text">Мой профиль</span>
        </li>
      </ul>
    </div>
  );
};

export default SidebarTeacher; 