import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useUser } from '../../UserContext';
import './Header.css';

const Header = ({ onLoginClick }) => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="primary" variant="dark" fixed="top">
      <Navbar.Brand href="/">EduConnect</Navbar.Brand>
      <Nav className="ms-auto">
        {user ? (
          <div className="nav-auth">
            <span>Привет, {user.username}!</span>
            <Button 
              variant="outline-light" 
              onClick={handleLogout}
            >
              Выход
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline-light" 
            onClick={onLoginClick}
          >
            Вход
          </Button>
        )}
      </Nav>
    </Navbar>
  );
};

export default Header; 