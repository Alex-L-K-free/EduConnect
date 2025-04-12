import React, { useState } from 'react';
import '../../styles/layout/Footer.scss';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <button className="footer-link" onClick={openModal}>О платформе</button>
          <div className="footer-center">
            <span>&copy; 2025 EduConnect</span>
            <span>Версия 4.0.0</span>
          </div>
          <a 
            href="https://t.me/your_support_account" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            Поддержка
          </a>
        </div>
      </footer>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>О платформе EduConnect</h2>
            <p>
              EduConnect - это инновационная образовательная платформа, 
              предназначенная для эффективного взаимодействия между 
              преподавателями и студентами. Наша цель - сделать 
              образование доступным и удобным для всех.
            </p>
            <button className="modal-close" onClick={closeModal}>Закрыть</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer; 