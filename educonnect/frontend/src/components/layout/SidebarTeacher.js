import React, { useState, useEffect } from 'react';
import './Sidebar.css'; // Импортируйте стили для Sidebar
import axios from 'axios';
import { useUser } from '../../UserContext';

const SidebarTeacher = ({ activePage, onNavigate, availableSubjects, availableClasses }) => {
  // Загружаем сохраненные состояния из localStorage
  const [openMenus, setOpenMenus] = useState(() => {
    const saved = localStorage.getItem('teacherSidebarOpenMenus');
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedItems, setSelectedItems] = useState(() => {
    const saved = localStorage.getItem('teacherSidebarSelectedItems');
    return saved ? JSON.parse(saved) : {};
  });

  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const { user } = useUser();

  // Сохраняем состояния в localStorage при их изменении
  useEffect(() => {
    localStorage.setItem('teacherSidebarOpenMenus', JSON.stringify(openMenus));
  }, [openMenus]);

  // Выносим логику восстановления выбранных предметов в отдельный useEffect
  useEffect(() => {
    localStorage.setItem('teacherSidebarSelectedItems', JSON.stringify(selectedItems));
  }, [selectedItems]);

  // Отдельный useEffect для восстановления выбранных предметов
  useEffect(() => {
    // Восстанавливаем выбранные предметы только если есть и предметы, и выбранные элементы
    if (teacherSubjects.length > 0 && selectedItems.subjects) {
      const selectedSubjectIds = teacherSubjects
        .filter(subject => selectedItems.subjects[subject.id])
        .map(subject => subject.id);
      
      if (selectedSubjectIds.length > 0) {
        // Используем setTimeout чтобы избежать циклических обновлений
        const timer = setTimeout(() => {
          onNavigate(`students/by-subjects/${selectedSubjectIds.join(',')}`);
        }, 0);
        
        return () => clearTimeout(timer);
      }
    }
  }, [teacherSubjects, selectedItems.subjects, onNavigate]);

  // Получаем предметы учителя при монтировании компонента
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        // Получаем предметы
        const subjectsResponse = await axios.get('/api/v1/subjects/', {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });
        
        // Создаем Set для хранения уникальных предметов
        const uniqueSubjects = new Map();
        
        // Фильтруем дубликаты, оставляя только уникальные предметы
        subjectsResponse.data.forEach(subject => {
          const subjectName = subject.name || subject.subject_name;
          if (!uniqueSubjects.has(subjectName)) {
            uniqueSubjects.set(subjectName, {
              id: subject.id.toString(),
              label: subjectName
            });
          }
        });
        
        // Преобразуем Map в массив
        const formattedSubjects = Array.from(uniqueSubjects.values());
        
        // Сортируем предметы по названию
        formattedSubjects.sort((a, b) => a.label.localeCompare(b.label));
        
        setTeacherSubjects(formattedSubjects);

        // Получаем список учеников (и их классов)
        const studentsResponse = await axios.get('/api/v1/students/', {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });

        // Получаем уникальные классы из списка учеников
        const classes = new Set();
        studentsResponse.data.forEach(student => {
          if (student.grade && student.index) {
            const className = `${student.grade}${student.index}`;
            classes.add(className);
          }
        });

        // Форматируем классы
        const formattedClasses = Array.from(classes).sort().map(className => ({
          id: `class-${className}`,
          label: `${className[0]} "${className.slice(1)}"` // Например: 5 "А"
        }));

        setTeacherClasses(formattedClasses);

      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      }
    };

    if (user && user.role === 'teacher') {
      fetchTeacherData();
    }
  }, [user]);

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
    e.stopPropagation();
    const newSelectedItems = {
      ...selectedItems,
      [menuId]: {
        ...selectedItems[menuId],
        [itemId]: !selectedItems[menuId]?.[itemId]
      }
    };
    setSelectedItems(newSelectedItems);

    if (menuId === 'subjects') {
      const selectedSubjectIds = teacherSubjects
        .filter(subject => newSelectedItems.subjects?.[subject.id])
        .map(subject => subject.id);
      
      onNavigate(`students/by-subjects/${selectedSubjectIds.join(',')}`);
    } else if (menuId === 'classes') {
      const selectedClassIds = teacherClasses
        .filter(classItem => newSelectedItems.classes?.[classItem.id])
        .map(classItem => classItem.id);
      
      onNavigate(`students/by-classes/${selectedClassIds.join(',')}`);
    } else {
      onNavigate(`${menuId}/${itemId}`);
    }
  };

  // Функция проверки доступности элемента
  const isItemAvailable = (menuId, itemId) => {
    if (menuId === 'subjects') {
      return availableSubjects.length === 0 || availableSubjects.includes(itemId);
    }
    if (menuId === 'classes') {
      return availableClasses.length === 0 || availableClasses.includes(itemId);
    }
    return true;
  };

  const menuItems = [
    {
      id: 'subjects',
      label: 'Предметы',
      icon: '📚',
      items: teacherSubjects
    },
    {
      id: 'classes',
      label: 'Классы',
      icon: '👥',
      items: teacherClasses
    },
    // {
    //   id: 'students',
    //   label: 'Ученики',
    //   icon: '🎓',
    //   items: [
    //     { id: 'class-5', label: '5 класс' },
    //     { id: 'class-6', label: '6 класс' },
    //     { id: 'class-7', label: '7 класс' }
    //   ]
    // },
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
          <span className="menu-text">Начальная</span>
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
                {menu.items?.map(item => {
                  const isAvailable = isItemAvailable(menu.id, item.id);
                  return (
                    <li
                      key={item.id}
                      className={`submenu-item ${
                        selectedItems[menu.id]?.[item.id] ? 'selected' : ''
                      } ${!isAvailable ? 'disabled' : ''}`}
                      onClick={(e) => isAvailable && handleSubmenuItemClick(menu.id, item.id, e)}
                    >
                      <span className="checkbox">
                        {selectedItems[menu.id]?.[item.id] ? '☑' : '☐'}
                      </span>
                      {item.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}

        {/* <li 
          className={activePage === 'profile' ? 'active' : ''}
          onClick={() => onNavigate('profile')}
        >
          <span className="menu-icon">👤</span>
          <span className="menu-text">Мой профиль</span>
        </li> */}
      </ul>
    </div>
  );
};

export default SidebarTeacher;