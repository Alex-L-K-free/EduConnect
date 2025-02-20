import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="container-fluid flex-grow-1">
        <div className="row">
          <div className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
            <Sidebar />
          </div>
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 