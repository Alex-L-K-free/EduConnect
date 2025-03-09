// import React from 'react';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useUser } from '../../UserContext';
// import './Header.css';
import LoginModal from '../LoginModal';
import { useNavigate } from 'react-router-dom';

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
    
    // Используем функцию logout из контекста
    logout();
    
    // Перенаправляем на главную
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container-fluid">
        {/* <a className="navbar-brand" href="/">EduConnect</a> */}
        <a className="navbar-brand" href="#!">EduConnect</a>
        <div className="nav-auth">
          {user ? (
            <div className="d-flex align-items-center">
              <span className="me-3">
                {/*{user.username} ({user.role})*/}
                {user.last_name} {user.first_name} {user.middle_name} ({user.role})
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

//     <Navbar bg="primary" variant="dark" fixed="top">
//       <Navbar.Brand href="/">EduConnect</Navbar.Brand>
//       <Nav className="ms-auto">
//         {user ? (
//           <div className="nav-auth">
//             <span>Привет, {user.username}!</span>
//             <Button 
//               variant="outline-light" 
//               onClick={handleLogout}
//             >
//               Выход
//             </Button>
//           </div>
//         ) : (
//           <Button 
//             variant="outline-light" 
//             onClick={onLoginClick}
//           >
//             Вход
//           </Button>
//         )}
//       </Nav>
//     </Navbar>
//   );
// };

export default Header; 