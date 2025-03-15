// import React from 'react';
import React, { useState } from 'react';
import { Button, Navbar, Nav, Dropdown } from 'react-bootstrap';
import { useUser } from '../../UserContext';
// import './Header.css';
import LoginModal from '../LoginModal';
import { useNavigate } from 'react-router-dom';
import './Header.css';

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

  const handleProfileClick = () => {
    switch (user.role) {
      case 'teacher':
        navigate('/teacher/profile');
        break;
      case 'student':
        navigate('/student/profile');
        break;
      case 'admin':
        navigate('/admin/profile');
        break;
      default:
        break;
    }
  };

  return (
    <Navbar bg="primary" variant="dark" fixed="top">
      <Navbar.Brand href="/">EduConnect</Navbar.Brand>
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
                <Dropdown.Item onClick={handleProfileClick}>
                  Мой профиль
                </Dropdown.Item>
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