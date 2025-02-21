import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import HomePage from './components/HomePage';
import Layout from './components/layout/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout activePage="home">
            <HomePage />
          </Layout>
        } />
        <Route path="/admin" element={
          <Layout activePage="admin">
            <AdminDashboard />
          </Layout>
        } />
        <Route path="/teacher" element={
          <Layout activePage="teacher">
            <TeacherDashboard />
          </Layout>
        } />
        <Route path="/student" element={
          <Layout activePage="student">
            <StudentDashboard />
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;
