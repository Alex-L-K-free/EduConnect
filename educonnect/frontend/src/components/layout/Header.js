import React, { useState } from 'react';
import { useUser } from '../../UserContext'; // Импортируем контекст
import LoginModal from '../LoginModal';
import { Button } from 'react-bootstrap';

const Header = () => {
  const { user, setUser } = useUser(); // Получаем пользователя и функцию для его установки
  const [showLogin, setShowLogin] = useState(false);

  const handleShow = () => setShowLogin(true);
  const handleClose = () => setShowLogin(false);

  const handleLogout = () => {
    setUser(null); // Удаляем пользователя
  };

  return (
    <header className="navbar">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">EduConnect</a>
        <div className="nav-auth">
          {user ? (
            <>
              <span className="navbar-text">{user.username}</span>
              <Button variant="link" onClick={handleLogout}>Выход</Button>
            </>
          ) : (
            <Button variant="link" onClick={handleShow}>Вход</Button>
          )}
        </div>
      </div>
      <LoginModal show={showLogin} handleClose={handleClose} />
    </header>
  );
};

export default Header; 