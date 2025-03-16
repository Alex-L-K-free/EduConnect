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
import TeacherProfile from './components/forms/teachers/TeacherProfile';
import SubjectsList from './components/forms/subjects/SubjectsList';
import StudentsList from './components/forms/students/StudentsList';

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
        <Route path="/teacher/profile" element={
          <Layout activePage="profile">
            <TeacherProfile />
          </Layout>
        } />
       <Route path="/teacher/subjects" element={
          <Layout activePage="subjects">
           <SubjectsList />
          </Layout>
        } />
        <Route path="/teacher/students" element={
           <Layout activePage="students">
             <StudentsList />
           </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;
