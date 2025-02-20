import React from 'react';
import Layout from './components/layout/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <Layout>
      <div className="container">
        <h1 className="text-center mt-4">Добро пожаловать в EduConnect</h1>
      </div>
    </Layout>
  );
}

export default App;
