import React, { useState } from 'react';
import './TeacherActions.css';

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

const TeacherActions = ({ students, selectedStudents }) => {
  const [showModal, setShowModal] = useState(false);

  const handleAddMaterial = (materialData) => {
    const selectedIds = students
      .filter(student => selectedStudents[student.id])
      .map(student => student.id);

    if (selectedIds.length > 0) {
      console.log('Добавить материал для:', selectedIds, 'с данными:', materialData);
      // Здесь будет логика добавления материала
    }
    setShowModal(false);
  };

  return (
    <div>
      {showModal && (
        <ActionModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddMaterial}
        />
      )}
      <div className="material-header">
        Материалы
        <button 
          className="add-material-btn"
          onClick={() => setShowModal(true)}
          title="Добавить материал выбранным ученикам"
        >
          +
        </button>
      </div>
    </div>
  );
};

export const MaterialCell = ({ materials }) => (
  <td className="add-material-column">
    {materials?.map((material, index) => (
      <span key={index} className="material-type-icon" title={material.type}>
        {material.type === 'document' && '📄'}
        {material.type === 'video' && '🎥'}
        {material.type === 'image' && '🖼️'}
      </span>
    ))}
  </td>
);

export default TeacherActions;
