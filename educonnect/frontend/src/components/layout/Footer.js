import React, { useState, useEffect, useRef } from 'react';
import '../../styles/layout/Footer.scss';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTelegramLink, setShowTelegramLink] = useState(false);
  const supportRef = useRef(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSupportClick = () => {
    setShowTelegramLink(!showTelegramLink);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (supportRef.current && !supportRef.current.contains(event.target)) {
        setShowTelegramLink(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <button className="footer-link" onClick={openModal}>О платформе</button>
          <div className="footer-center">
            <span>&copy; 2025 EduConnect</span>
            <span>Версия 4.0.0</span>
          </div>
          <div className="footer-support" ref={supportRef}>
            <div className="telegram-container">
              {showTelegramLink && (
                <a 
                  href="https://t.me/Alex_L_K" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="telegram-link"
                >
                  <svg className="telegram-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM8.28479 5.98895C7.50229 6.31245 5.93729 6.97345 3.59979 7.96295C3.23729 8.10645 3.04979 8.24695 3.03729 8.38445C3.01479 8.62195 3.31229 8.71595 3.71479 8.84695L3.91479 8.91695C4.30979 9.04995 4.84229 9.20445 5.12479 9.21045C5.37979 9.21595 5.66229 9.11495 5.97229 8.90645C8.14729 7.44645 9.27229 6.71145 9.34729 6.70145C9.39979 6.69445 9.47229 6.68545 9.52229 6.72945C9.57229 6.77345 9.56729 6.85645 9.56229 6.88045C9.52979 7.02395 8.30729 8.16745 7.67729 8.75195C7.48729 8.92645 7.35229 9.05145 7.32229 9.08295C7.25729 9.15045 7.19079 9.21495 7.12729 9.27645C6.73729 9.65145 6.44229 9.93645 7.14479 10.4C7.48229 10.6359 7.75229 10.8305 8.02129 11.0245C8.31479 11.2364 8.60729 11.4475 8.98979 11.7105C9.09479 11.7865 9.19479 11.8655 9.29229 11.942C9.63729 12.2255 9.94729 12.4805 10.3323 12.442C10.5523 12.419 10.7798 12.2145 10.8948 11.6055C11.2198 9.96645 11.8573 6.39145 12.0048 4.96945C12.0173 4.83245 12.0133 4.66495 12.0098 4.59295C12.0068 4.52095 11.9958 4.41945 11.9123 4.34445C11.8123 4.25445 11.6548 4.23245 11.5848 4.23345C11.2948 4.23745 10.8498 4.38895 8.28479 5.98895Z"/>
                  </svg>
                  @Alex_L_K
                </a>
              )}
            </div>
            <button 
              type="button"
              className="footer-link" 
              onClick={handleSupportClick}
            >
              {/* <svg className="telegram-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM8.28479 5.98895C7.50229 6.31245 5.93729 6.97345 3.59979 7.96295C3.23729 8.10645 3.04979 8.24695 3.03729 8.38445C3.01479 8.62195 3.31229 8.71595 3.71479 8.84695L3.91479 8.91695C4.30979 9.04995 4.84229 9.20445 5.12479 9.21045C5.37979 9.21595 5.66229 9.11495 5.97229 8.90645C8.14729 7.44645 9.27229 6.71145 9.34729 6.70145C9.39979 6.69445 9.47229 6.68545 9.52229 6.72945C9.57229 6.77345 9.56729 6.85645 9.56229 6.88045C9.52979 7.02395 8.30729 8.16745 7.67729 8.75195C7.48729 8.92645 7.35229 9.05145 7.32229 9.08295C7.25729 9.15045 7.19079 9.21495 7.12729 9.27645C6.73729 9.65145 6.44229 9.93645 7.14479 10.4C7.48229 10.6359 7.75229 10.8305 8.02129 11.0245C8.31479 11.2364 8.60729 11.4475 8.98979 11.7105C9.09479 11.7865 9.19479 11.8655 9.29229 11.942C9.63729 12.2255 9.94729 12.4805 10.3323 12.442C10.5523 12.419 10.7798 12.2145 10.8948 11.6055C11.2198 9.96645 11.8573 6.39145 12.0048 4.96945C12.0173 4.83245 12.0133 4.66495 12.0098 4.59295C12.0068 4.52095 11.9958 4.41945 11.9123 4.34445C11.8123 4.25445 11.6548 4.23245 11.5848 4.23345C11.2948 4.23745 10.8498 4.38895 8.28479 5.98895Z"/>
              </svg> */}
              Поддержка
            </button>
          </div>
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