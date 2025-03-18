import React, { useState } from 'react';
import './TeacherActionModal.css';

const ActionModal = ({ onClose, onSubmit }) => {
  const [materialData, setMaterialData] = useState({
    type: 'document',
    location: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(materialData);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Добавить материал</h3>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Тип материала</label>
            <select
              value={materialData.type}
              onChange={(e) => setMaterialData({...materialData, type: e.target.value})}
            >
              <option value="document">Документ</option>
              <option value="video">Видео</option>
              <option value="image">Изображение</option>
            </select>
          </div>
          <div className="form-group">
            <label>Расположение</label>
            <input 
              type="text"
              value={materialData.location}
              onChange={(e) => setMaterialData({...materialData, location: e.target.value})}
              placeholder="URL или путь к файлу"
            />
          </div>
          <div className="form-group">
            <label>Описание/Задание</label>
            <textarea
              value={materialData.description}
              onChange={(e) => setMaterialData({...materialData, description: e.target.value})}
              placeholder="Введите описание или задание"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-btn secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="modal-btn primary">
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionModal;
