import React, { useState } from 'react';
import LoginModal from '../LoginModal';
import { Button } from 'react-bootstrap';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);

  const handleShow = () => setShowLogin(true);
  const handleClose = () => setShowLogin(false);

  return (
    <header className="navbar">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">EduConnect</a>
        <div className="nav-auth">
          <a href="/register">Регистрация</a>
          <Button variant="link" onClick={handleShow}>Вход</Button>
        </div>
      </div>
      <LoginModal show={showLogin} handleClose={handleClose} />
    </header>
  );
};

export default Header; 