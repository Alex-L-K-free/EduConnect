import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { useUser } from '../../UserContext';
import axios from 'axios';

const SidebarStudent = ({ activePage }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Загружаем сохраненные состояния из localStorage
  const [openMenus, setOpenMenus] = useState(() => {
    const saved = localStorage.getItem('studentSidebarOpenMenus');
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedItems, setSelectedItems] = useState(() => {
    const saved = localStorage.getItem('studentSidebarSelectedItems');
    return saved ? JSON.parse(saved) : {};
  });

  const [studentSubjects, setStudentSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState(() => {
    const saved = localStorage.getItem('selectedSubjects');
    return saved ? JSON.parse(saved) : [];
  });

  // Сохраняем состояния в localStorage при их изменении
  useEffect(() => {
    localStorage.setItem('studentSidebarOpenMenus', JSON.stringify(openMenus));
  }, [openMenus]);

  useEffect(() => {
    localStorage.setItem('studentSidebarSelectedItems', JSON.stringify(selectedItems));
  }, [selectedItems]);

  useEffect(() => {
    localStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
  }, [selectedSubjects]);

  useEffect(() => {
    const loadSubjects = async () => {
      if (user?.token) {
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/v1/students/profile/', {
            headers: {
              'Authorization': `Token ${user.token}`
            }
          });
          
          if (response.data.subject) {
            const subjectsList = response.data.subject.split(',')
              .map(s => s.trim())
              .filter(s => s) // Фильтруем пустые строки
              .map((subject, index) => ({
                id: `subject-${index}`,
                label: subject
              }));
            setStudentSubjects(subjectsList);
          }
        } catch (error) {
          console.error('Ошибка при загрузке предметов:', error);
        }
      }
    };

    loadSubjects();
  }, [user]);

  const handleMainClick = () => {
    navigate('/student');
    setSelectedSubjects([]); // Сбрасываем выбранные предметы при возврате на главную
  };

  // Обработчик для переключения раскрывающегося меню
  const toggleSubmenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Обновляем обработчик клика по элементу подменю
  const handleSubmenuItemClick = (menuId, itemId, e) => {
    e.stopPropagation();
    
    // Находим предмет
    const subject = studentSubjects.find(s => s.id === itemId);
    if (!subject) return;

    // Обновляем состояние выбранных предметов
    setSelectedSubjects(prev => {
      const isSelected = prev.includes(subject.label);
      if (isSelected) {
        // Если предмет уже выбран - удаляем его
        return prev.filter(s => s !== subject.label);
      } else {
        // Если предмет не выбран - добавляем его
        return [...prev, subject.label];
      }
    });

    // Обновляем чекбоксы
    setSelectedItems(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [itemId]: !prev[menuId]?.[itemId]
      }
    }));

    // Формируем URL с выбранными предметами
    const nextSubjects = selectedSubjects.includes(subject.label)
      ? selectedSubjects.filter(s => s !== subject.label)
      : [...selectedSubjects, subject.label];
    
    if (nextSubjects.length > 0) {
      navigate(`/student/subjects/${nextSubjects.join(',')}`);
    } else {
      navigate('/student'); // Если ничего не выбрано - возвращаемся на главную
    }
  };

  const menuItems = [
    {
      id: 'subjects',
      label: 'Предметы',
      icon: '📚',
      items: studentSubjects
    }
  ];

  return (
    <div className="sidebar" style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <ul className="sidebar-nav">
        <li 
          className={activePage === 'student' ? 'active' : ''}
          onClick={handleMainClick}
        >
          <span className="menu-icon">🏠</span>
          <span className="menu-text">Начальная</span>
        </li>
        
        {menuItems.map(menu => (
          <li 
            key={menu.id}
            className={`menu-item ${openMenus[menu.id] ? 'open' : ''}`}
            onClick={() => toggleSubmenu(menu.id)}
          >
            <div className="menu-header">
              <span className="menu-icon">{menu.icon}</span>
              <span className="menu-text">{menu.label}</span>
              <span className={`arrow ${openMenus[menu.id] ? 'down' : 'right'}`}>▸</span>
            </div>
            
            {openMenus[menu.id] && (
              <ul className="submenu">
                {menu.items?.map(item => (
                  <li
                    key={item.id}
                    className={`submenu-item ${
                      selectedSubjects.includes(item.label) ? 'active' : ''
                    }`}
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
      </ul>
    </div>
  );
};

export default SidebarStudent;