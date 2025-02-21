import React from 'react';
import Header from './Header';
import Footer from './Footer';
import SidebarAdmin from './SidebarAdmin';
import SidebarStudent from './SidebarStudent';
import SidebarTeacher from './SidebarTeacher';
import './Layout.css'; // Импортируйте стили для Layout

const Layout = ({ children, activePage, userRole }) => {
  let SidebarComponent;

  switch (userRole) {
    case 'admin':
      SidebarComponent = SidebarAdmin;
      break;
    case 'teacher':
      SidebarComponent = SidebarTeacher;
      break;
    case 'student':
      SidebarComponent = SidebarStudent;
      break;
    default:
      SidebarComponent = null; // Не используйте сайдбар по умолчанию
  }

  return (
    <div className="layout">
      <Header />
      <div className="content-wrapper">
        {SidebarComponent && <SidebarComponent activePage={activePage} />}
        <main className="main-content">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 