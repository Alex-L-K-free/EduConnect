import React, { useState } from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar

const SidebarTeacher = ({ activePage, onNavigate }) => {
  // Состояния для отслеживания открытых подменю
  const [openMenus, setOpenMenus] = useState({});
  const [selectedItems, setSelectedItems] = useState({});

  const handleMainClick = () => {
    onNavigate('main');
  };

  // Обработчик для переключения раскрывающегося меню
  const toggleSubmenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Обработчик выбора элемента подменю
  const handleSubmenuItemClick = (menuId, itemId, e) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    setSelectedItems(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [itemId]: !prev[menuId]?.[itemId]
      }
    }));
    onNavigate(`${menuId}/${itemId}`);
  };

  const menuItems = [
    {
      id: 'subjects',
      label: 'Предметы',
      icon: '📚',
      items: [
        { id: 'math', label: 'Математика' },
        { id: 'physics', label: 'Физика' },
        { id: 'chemistry', label: 'Химия' },
        { id: 'biology', label: 'Биология' },
        { id: 'history', label: 'История' },
        // Добавим больше предметов для проверки прокрутки
        { id: 'literature', label: 'Литература' },
        { id: 'geography', label: 'География' },
        { id: 'informatics', label: 'Информатика' },
        { id: 'english', label: 'Английский язык' },
        { id: 'french', label: 'Французский язык' }
      ]
    },
    {
      id: 'classes',
      label: 'Классы',
      icon: '👥',
      items: [
        { id: '5a', label: '5 А' },
        { id: '5b', label: '5 Б' },
        { id: '6a', label: '6 А' },
        { id: '6b', label: '6 Б' },
        { id: '7a', label: '7 А' },
        { id: '7b', label: '7 Б' },
        { id: '8a', label: '8 А' },
        { id: '8b', label: '8 Б' }
      ]
    },
    {
      id: 'students',
      label: 'Ученики',
      icon: '🎓',
      items: [
        { id: 'class-5', label: '5 класс' },
        { id: 'class-6', label: '6 класс' },
        { id: 'class-7', label: '7 класс' }
      ]
    },
    {
      id: 'materials',
      label: 'Материалы',
      icon: '📝',
      items: [
        { id: 'lessons', label: 'Уроки' },
        { id: 'homework', label: 'Домашние задания' },
        { id: 'tests', label: 'Тесты' }
      ]
    },
    {
      id: 'messages',
      label: 'Сообщения',
      icon: '✉️',
      items: [
        { id: 'inbox', label: 'Входящие' },
        { id: 'sent', label: 'Отправленные' },
        { id: 'drafts', label: 'Черновики' }
      ]
    },
    {
      id: 'notifications',
      label: 'Уведомления',
      icon: '🔔',
      items: [
        { id: 'new', label: 'Новые' },
        { id: 'read', label: 'Прочитанные' },
        { id: 'all', label: 'Все' }
      ]
    }
  ];

  return (
    <div className="sidebar" style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      {/* <h2>Учитель</h2> */}
      <ul className="sidebar-nav">
        <li 
          className={activePage === 'main' ? 'active' : ''}
          onClick={handleMainClick}
        >
          <span className="menu-icon">🏠</span>
          <span className="menu-text">Главная</span>
        </li>
        
        {menuItems.map(menu => (
          <li 
            key={menu.id}
            className={`menu-item ${openMenus[menu.id] ? 'open' : ''} ${
              activePage.startsWith(menu.id) ? 'active' : ''
            }`}
            onClick={() => toggleSubmenu(menu.id)}
          >
            <div className="menu-header">
              <span className="menu-icon">{menu.icon}</span>
              <span className="menu-text">{menu.label}</span>
              <span className={`arrow ${openMenus[menu.id] ? 'down' : 'right'}`}>▸</span>
            </div>
            
            {openMenus[menu.id] && (
              <ul className="submenu">
                {menu.items.map(item => (
                  <li
                    key={item.id}
                    className={`submenu-item ${selectedItems[menu.id]?.[item.id] ? 'selected' : ''}`}
                    onClick={(e) => handleSubmenuItemClick(menu.id, item.id, e)}
                  >
                    <span className="checkbox">
                      {selectedItems[menu.id]?.[item.id] ? '☑' : '☐'}
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}

        <li 
          className={activePage === 'profile' ? 'active' : ''}
          onClick={() => onNavigate('profile')}
        >
          <span className="menu-icon">👤</span>
          <span className="menu-text">Мой профиль</span>
        </li>
      </ul>
    </div>
  );
};

export default SidebarTeacher; 