import React from 'react';
import Header from './Header';
import Footer from './Footer';
// import Sidebar from './Sidebar';
// import SidebarAdmin from './SidebarAdmin';

const Layout = ({ children, activePage }) => {
  return (
    <div className="layout">
      <Header />
      <div className="content-wrapper">
        {/* <Sidebar activePage={activePage} /> */}
        <main>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 