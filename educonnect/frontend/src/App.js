import React from 'react';
import Layout from './components/layout/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <Layout>
      <div className="welcome-container">
        <h1>Добро пожаловать в EduConnect</h1>
        <p>Платформа для эффективного взаимодействия учителя и учеников</p>
      </div>
    </Layout>
  );
}

export default App;
