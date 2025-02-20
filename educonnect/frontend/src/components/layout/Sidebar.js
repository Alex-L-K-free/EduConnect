import React from 'react';

const Sidebar = () => {
  return (
    <div className="position-sticky pt-3">
      <ul className="nav flex-column">
        <li className="nav-item">
          <a className="nav-link active" href="/">
            <i className="bi bi-house-door me-2"></i>
            Главная
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/subjects">
            <i className="bi bi-book me-2"></i>
            Предметы
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/assignments">
            <i className="bi bi-clipboard-check me-2"></i>
            Задания
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/messages">
            <i className="bi bi-chat-dots me-2"></i>
            Сообщения
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar; 