import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Sidebar.css';
import { useUser } from '../../UserContext';

const SidebarStudent = ({ activePage }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (user && user.token) {
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/v1/students/current/', {
            headers: {
              'Authorization': `Token ${user.token}`
            }
          });
          setSubjects(response.data.subjects || []);
        } catch (error) {
          console.error('Ошибка при загрузке предметов:', error);
        }
      }
    };

    fetchSubjects();
  }, [user]);

  const handleMainClick = () => {
    navigate('/student');
  };

  const handleSubjectClick = (subject) => {
    navigate(`/student/subjects/${subject}`);
  };

  return (
    <div className="sidebar" style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <h2>ученик</h2>
      <ul className="sidebar-nav">
        <li 
          className={activePage === 'student' ? 'active' : ''}
          onClick={handleMainClick}
        >
          <span className="menu-icon">🏠</span>
          <span className="menu-text">Начальная</span>
        </li>
        <li className={activePage === 'subjects' ? 'active menu-item' : 'menu-item'}>
          <div className="menu-header">
            <span className="menu-icon">📚</span>
            <span className="menu-text">Предметы</span>
          </div>
          <ul className="submenu">
            {subjects.map((subject, index) => (
              <li
                key={index}
                className={`submenu-item ${activePage === `subjects/${subject}` ? 'active' : ''}`}
                onClick={() => handleSubjectClick(subject)}
              >
                {subject}
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default SidebarStudent;