import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Sidebar.css';
import { useUser } from '../../UserContext';
import axios from 'axios';

const SidebarStudent = ({ activePage }) => {
  const navigate = useNavigate();
  const { subjects } = useParams();
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

  // При монтировании компонента устанавливаем чекбоксы из URL
  useEffect(() => {
    if (subjects) {
      const selectedSubjects = subjects.split(',');
      setSelectedItems(prevItems => {
        // Проверяем, нужно ли обновлять состояние
        const currentSelected = studentSubjects
          .filter(s => prevItems.subjects?.[s.id])
          .map(s => s.label);
        
        const needsUpdate = selectedSubjects.length !== currentSelected.length ||
          !selectedSubjects.every(s => currentSelected.includes(s));

        if (!needsUpdate) return prevItems;

        // Обновляем состояние только если есть изменения
        return {
          ...prevItems,
          subjects: {
            ...prevItems.subjects,
            ...studentSubjects.reduce((acc, subject) => ({
              ...acc,
              [subject.id]: selectedSubjects.includes(subject.label)
            }), {})
          }
        };
      });
    }
  }, [subjects, studentSubjects, selectedItems]);

  // Сохраняем состояния в localStorage
  useEffect(() => {
    localStorage.setItem('studentSidebarOpenMenus', JSON.stringify(openMenus));
  }, [openMenus]);

  useEffect(() => {
    localStorage.setItem('studentSidebarSelectedItems', JSON.stringify(selectedItems));
  }, [selectedItems]);

  // Загрузка предметов
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
              .filter(s => s)
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
  };

  const toggleSubmenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Обработчик клика по пункту "Предметы"
  const handleSubjectsClick = (menuId) => {
    toggleSubmenu(menuId);
    // Если есть выбранные предметы, сохраняем их в URL
    const selectedSubjects = studentSubjects
      .filter(s => selectedItems.subjects?.[s.id])
      .map(s => s.label);

    if (selectedSubjects.length > 0) {
      navigate(`/student/subjects/${selectedSubjects.join(',')}`);
    } else {
      navigate('/student/subjects');
    }
  };

  // Обновленный обработчик клика по чекбоксу
  const handleSubmenuItemClick = (menuId, itemId, e) => {
    e.stopPropagation();
    
    const subject = studentSubjects.find(s => s.id === itemId);
    if (!subject) return;

    // Обновляем состояние чекбоксов
    const newSelectedItems = {
      ...selectedItems,
      [menuId]: {
        ...selectedItems[menuId],
        [itemId]: !selectedItems[menuId]?.[itemId]
      }
    };
    setSelectedItems(newSelectedItems);

    // Формируем список выбранных предметов
    const selectedSubjects = studentSubjects
      .filter(s => newSelectedItems[menuId]?.[s.id])
      .map(s => s.label);

    // Обновляем URL в зависимости от выбранных предметов
    if (selectedSubjects.length > 0) {
      navigate(`/student/subjects/${selectedSubjects.join(',')}`);
    } else {
      navigate('/student/subjects');
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
            className={`menu-item ${openMenus[menu.id] ? 'open' : ''} ${
              activePage === 'subjects' ? 'active' : ''
            }`}
            onClick={() => handleSubjectsClick(menu.id)}
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
                    className="submenu-item"
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