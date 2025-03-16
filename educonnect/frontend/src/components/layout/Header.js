// import React from 'react';
import React, { useState } from 'react';
import { Button, Navbar, Nav, Dropdown } from 'react-bootstrap';
import { useUser } from '../../UserContext';
// import './Header.css';
import LoginModal from '../LoginModal';
import { useNavigate } from 'react-router-dom';
import educonnectLogo from '../../assets/images/educonnect-logo.png';
import './Header.css';
// import logo from '/educonnect-logo.png';

const Header = () => {
  const { user, logout } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleShow = () => setShowLogin(true);
  const handleClose = () => setShowLogin(false);

  const handleLogout = () => {
    // Очищаем localStorage и выполняем выход
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    
    // Используем функцию logout из контекста
    logout();
    
    // Перенаправляем на главную
    navigate('/');
  };

  const getUserFullName = () => {
    if (user) {
      const fullName = `${user.last_name || ''} ${user.first_name || ''} ${user.middle_name || ''}`.trim();
      const role = user.role === 'teacher' ? 'учитель' : 
                  user.role === 'student' ? 'ученик' : 
                  user.role === 'admin' ? 'администратор' : '';
      return `${fullName} (${role})`;
    }
    return '';
  };

  // Функция для перехода на главную страницу в зависимости от роли
  const navigateToHome = () => {
    if (!user) {
      navigate('/');
      return;
    }
    
    switch(user.role) {
      case 'teacher':
        navigate('/teacher');
        break;
      case 'student':
        navigate('/student');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  const handleMenuClick = (page) => {
    switch(page) {
      case 'profile':
        navigate('/teacher/profile');
        break;
      case 'subjects':
        navigate('/teacher/subjects');
        break;
      case 'students':
        navigate('/teacher/students');
        break;
      default:
        navigate(`/${page}`);
    }
  };

  const renderTeacherSubmenu = () => (
    <>
      <Dropdown.Item onClick={() => handleMenuClick('profile')}>
        Мой профиль
      </Dropdown.Item>
      <Dropdown.Item onClick={() => handleMenuClick('subjects')}>
        Мои предметы
      </Dropdown.Item>
      <Dropdown.Item onClick={() => handleMenuClick('students')}>
        Мои ученики
      </Dropdown.Item>
    </>
  );

  const renderUserSubmenu = () => {
    switch (user?.role) {
      case 'teacher':
        return renderTeacherSubmenu();
      case 'student':
        return (
          <Dropdown.Item onClick={() => handleMenuClick('student')}>
            Мой кабинет
          </Dropdown.Item>
        );
      case 'admin':
        return (
          <Dropdown.Item onClick={() => handleMenuClick('admin')}>
            Мой кабинет
          </Dropdown.Item>
        );
      default:
        return null;
    }
  };

  return (
    <Navbar bg="primary" variant="dark" fixed="top">
      {/*<Navbar.Brand href="/">EduConnect</Navbar.Brand>*/}
      <Navbar.Brand href="/">
        <img
          src={educonnectLogo}
          alt="EduConnect"
          className="header-logo"
        />
        EduConnect
      </Navbar.Brand>
      
      {/* Добавляем кнопку "Главная" */}
      {user && (
        <Nav className="ms-3">
          <Nav.Link 
            onClick={navigateToHome}
            className="text-white fw-bold"
          >
            Главная
          </Nav.Link>
        </Nav>
      )}
      
      <Nav className="ms-auto">
        {user ? (
          <div className="nav-auth">
            <Dropdown align="end">
              <Dropdown.Toggle 
                variant="transparent" 
                id="user-dropdown"
                className="user-dropdown-toggle"
              >
                {getUserFullName()}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {renderUserSubmenu()}
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  Выход
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ) : (
          <Button 
            variant="outline-light" 
            onClick={handleShow}
          >
            Вход
          </Button>
        )}
      </Nav>

      <LoginModal 
        show={showLogin} 
        onHide={handleClose}
      />
    </Navbar>
  );
};

export default Header; 