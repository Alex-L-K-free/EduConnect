import React, { useState } from 'react';
import './TeacherActions.css';

const ActionModal = ({ onClose, onSubmit }) => {
  const [materialData, setMaterialData] = useState({
    location: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!materialData.location.trim()) {
      newErrors.location = 'Необходимо указать расположение';
    }
    if (!materialData.description.trim()) {
      newErrors.description = 'Необходимо добавить описание';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(materialData);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Добавить материал</h3>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Расположение</label>
            <input 
              type="text"
              value={materialData.location}
              onChange={(e) => setMaterialData({...materialData, location: e.target.value})}
              placeholder="URL или путь к файлу"
            />
            {errors.location && <span className="error">{errors.location}</span>}
          </div>
          <div className="form-group">
            <label>Описание/Задание</label>
            <textarea
              value={materialData.description}
              onChange={(e) => setMaterialData({...materialData, description: e.target.value})}
              placeholder="Введите описание или задание"
            />
            {errors.description && <span className="error">{errors.description}</span>}
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

const UploadPanel = ({ onUpload, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onUpload(files);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '*/*';
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      onUpload(files);
    };
    input.click();
  };

  return (
    <div className="quick-add-panel" onClick={e => e.stopPropagation()}>
      <div 
        className={`upload-zone ${isDragging ? 'active' : ''}`}
        onClick={handleFileSelect}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="upload-text">
          Перетащите файлы сюда
        </div>
        <div className="upload-hint">
          или нажмите для выбора
        </div>
      </div>
    </div>
  );
};

// Удаляем QuickAddPanel полностью

const TeacherActions = ({ students, selectedStudents }) => {
  const [showModal, setShowModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    console.log('Перетащенные файлы:', files);
    // Здесь логика обработки перетащенных файлов
  };

  const handleUpload = (files) => {
    const selectedIds = students
      .filter(student => selectedStudents[student.id])
      .map(student => student.id);

    if (selectedIds.length > 0 && files.length > 0) {
      console.log('Загрузка файлов:', files, 'для студентов:', selectedIds);
      // Здесь логика загрузки файлов
    }
    setShowUpload(false);
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
        <div className="material-actions">
          Материалы
          <div className="materials-dropdown">
            <button 
              className="add-material-btn"
              onClick={() => setShowUpload(!showUpload)}
              title="Загрузить материалы"
            >
              +
            </button>
            {showUpload && (
              <UploadPanel 
                onUpload={handleUpload}
                onClose={() => setShowUpload(false)}
              />
            )}
          </div>
        </div>
      </div>
      <div 
        className={`drop-zone ${isDragging ? 'active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Перетащите файлы сюда или выберите способ добавления выше */}
      </div>
    </div>
  );
};

export const MaterialCell = ({ materials }) => (
  <td className="add-material-column">
    {materials?.map((material, index) => (
      <span key={index} className="material-type-icon">📄</span>
    ))}
  </td>
);

export default TeacherActions;
