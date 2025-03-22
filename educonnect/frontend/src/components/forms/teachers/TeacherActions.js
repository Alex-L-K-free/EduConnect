import React, { useState } from 'react';
import axios from 'axios'; // Добавляем импорт axios
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

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
        <div className="upload-text">Перетащите файлы сюда</div>
        <div className="upload-hint">или нажмите для выбора</div>
      </div>
    </div>
  );
};

const DescriptionPanel = ({ onSubmit, onClose }) => {
  const [description, setDescription] = useState('');
  
  const handleSubmit = () => {
    if (description.trim()) {
      onSubmit(description);
      setDescription('');
    }
  };

  return (
    <div className="quick-add-panel" onClick={e => e.stopPropagation()}>
      <div className="description-input-zone">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Введите текст задания"
          className="description-textarea"
          autoFocus
        />
        <button 
          className="description-submit-btn"
          onClick={handleSubmit}
          disabled={!description.trim()}
        >
          Добавить
        </button>
      </div>
    </div>
  );
};

export const DescriptionCell = ({ descriptions }) => (
  <td className="add-description-column">
    {descriptions?.map((desc, index) => (
      <span key={index} className="description-type-icon" title={desc.text}>📝</span>
    ))}
  </td>
);

// Добавляем новый компонент MessageCell после DescriptionCell
export const MessageCell = ({ messages }) => (
  <td className="add-message-column">
    {messages?.map((msg, index) => (
      <span key={index} className="message-type-icon" title={msg.text}>💬</span>
    ))}
  </td>
);

const TeacherActions = ({ students, selectedStudents, onMaterialsUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
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

  const handleAddDescription = (text) => {
    const selectedIds = students
      .filter(student => selectedStudents[student.id])
      .map(student => student.id);

    if (selectedIds.length > 0) {
      console.log('Добавить описание для:', selectedIds, 'с текстом:', text);
      // Здесь будет логика добавления описания
    }
    setShowDescription(false);
  };

  const handleAddMessage = (text) => {
    const selectedIds = students
      .filter(student => selectedStudents[student.id])
      .map(student => student.id);

    if (selectedIds.length > 0) {
      console.log('Добавить сообщение для:', selectedIds, 'с текстом:', text);
      // Здесь будет логика добавления сообщения
    }
    setShowMessage(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    console.log('Перетащенные файлы:', files);
    // Здесь логика обработки перетащенных файлов
  };

  const handleUpload = async (files) => {
    const selectedIds = students
      .filter(student => selectedStudents[student.id])
      .map(student => student.id);

    if (selectedIds.length > 0 && files.length > 0) {
      try {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('file', file);
        });
        formData.append('student_ids', JSON.stringify(selectedIds));
        
        const response = await axios.post('/api/v1/materials/add/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });

        // Получаем обновленные данные для каждого выбранного студента
        const updatedStudents = await Promise.all(
          selectedIds.map(async (studentId) => {
            const materialResponse = await axios.get(`/api/v1/materials/student/${studentId}/`, {
              headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
              }
            });
            return {
              ...students.find(s => s.id === studentId),
              materials: materialResponse.data
            };
          })
        );

        // Обновляем состояние с новыми материалами
        const newStudents = students.map(student => {
          const updatedStudent = updatedStudents.find(us => us.id === student.id);
          return updatedStudent || student;
        });

        onMaterialsUpdate(newStudents);
        setShowUpload(false);
      } catch (error) {
        console.error('Ошибка при загрузке материалов:', error);
      }
    }
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
        <div className="material-actions">
          Задание
          <div className="materials-dropdown">
            <button 
              className="add-material-btn"
              onClick={() => setShowDescription(!showDescription)}
              title="Добавить задание"
            >
              +
            </button>
            {showDescription && (
              <DescriptionPanel
                onSubmit={handleAddDescription}
                onClose={() => setShowDescription(false)}
              />
            )}
          </div>
        </div>
        <div className="material-actions">
          Сообщение
          <div className="materials-dropdown">
            <button 
              className="add-material-btn"
              onClick={() => setShowMessage(!showMessage)}
              title="Добавить сообщение"
            >
              +
            </button>
            {showMessage && (
              <DescriptionPanel
                onSubmit={handleAddMessage}
                onClose={() => setShowMessage(false)}
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

export const MaterialCell = ({ materials = [] }) => (
  <td className="add-material-column">
    {materials && materials.length > 0 ? materials.map((material, index) => (
      <span 
        key={material.id || index} 
        className="material-type-icon" 
        title={material.title || 'Материал'}
        onClick={() => window.open(material.file, '_blank')}
      >
        {getFileIcon(material.material_type)}
      </span>
    )) : null}
  </td>
);

const getFileIcon = (type) => {
  switch (type) {
    case 'document': return '📄';
    case 'video': return '🎥';
    case 'presentation': return '📊';
    case 'link': return '🔗';
    default: return '📁';
  }
};

export default TeacherActions;
