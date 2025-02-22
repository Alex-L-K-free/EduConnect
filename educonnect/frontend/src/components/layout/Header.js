import React, { useState } from 'react';
import { useUser } from '../../UserContext'; // Импортируем контекст
import LoginModal from '../LoginModal';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, setUser } = useUser(); // Получаем пользователя и функцию для его установки
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleShow = () => setShowLogin(true);
  const handleClose = () => setShowLogin(false);

  const handleLogout = () => {
    // Очищаем localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    
    // Очищаем состояние пользователя
    setUser(null);
    
    // Перенаправляем на главную
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">EduConnect</a>
        <div className="nav-auth">
          {user ? (
            <div className="d-flex align-items-center">
              <span className="me-3">
                {user.username} ({user.role})
              </span>
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={handleLogout}
              >
                Выход
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={handleShow}
            >
              Вход
            </Button>
          )}
        </div>
      </div>
      <LoginModal show={showLogin} onHide={handleClose} />
    </header>
  );
};

export default Header; 