import React from 'react';

const Header = () => {
  return (
    <header className="navbar">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">EduConnect</a>
        <div className="nav-auth">
          <a href="/register">Регистрация</a>
          <a href="/login">Вход</a>
        </div>
      </div>
    </header>
  );
};

export default Header; 