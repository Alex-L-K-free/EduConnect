import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <div className="content-wrapper">
        <Sidebar />
        <main>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 