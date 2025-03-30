import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
// import { useUser } from '../../UserContext';

const SidebarStudent = ({ activePage }) => {
  const navigate = useNavigate();
  // const { user } = useUser();

  const handleMainClick = () => {
    navigate('/student');
  };

  return (
    <div className="sidebar" style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      {/* <h2>ученик</h2> */}
      <ul className="sidebar-nav">
        <li 
          className={activePage === 'student' ? 'active' : ''}
          onClick={handleMainClick}
        >
          <span className="menu-icon">🏠</span>
          <span className="menu-text">Начальная</span>
        </li>
      </ul>
    </div>
  );
};

export default SidebarStudent;