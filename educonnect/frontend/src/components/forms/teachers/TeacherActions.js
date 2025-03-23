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

const TeacherActions = ({ students, selectedStudents, onMaterialsUpdate, type }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const getTitle = () => {
    switch (type) {
      case 'materials': return 'Материалы';
      case 'tasks': return 'Задания';
      case 'messages': return 'Сообщения';
      default: return 'Действия';
    }
  };

  const handleClick = () => {
    switch (type) {
      case 'materials':
        setShowUpload(!showUpload);
        break;
      case 'tasks':
        setShowDescription(!showDescription);
        break;
      case 'messages':
        setShowMessage(!showMessage);
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setShowUpload(false);
    setShowDescription(false);
    setShowMessage(false);
  };

  const handleAddDescription = async (text) => {
    const selectedIds = students
      .filter(student => selectedStudents[student.id])
      .map(student => student.id);

    if (selectedIds.length > 0) {
      try {
        await axios.post('/api/v1/materials/add-description/', {
          student_ids: selectedIds,
          description: text
        }, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });
        handleClose();
        onMaterialsUpdate();
      } catch (error) {
        console.error('Ошибка при добавлении описания:', error);
      }
    }
  };

  const handleAddMessage = async (text) => {
    const selectedIds = students
      .filter(student => selectedStudents[student.id])
      .map(student => student.id);

    if (selectedIds.length > 0) {
      try {
        await axios.post('/api/v1/materials/add-message/', {
          student_ids: selectedIds,
          message: text
        }, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });
        handleClose();
        onMaterialsUpdate();
      } catch (error) {
        console.error('Ошибка при добавлении сообщения:', error);
      }
    }
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
        
        await axios.post('/api/v1/materials/add/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });

        // Получаем обновленные материалы
        const updatedMaterials = await Promise.all(
          selectedIds.map(async (studentId) => {
            const response = await axios.get(`/api/v1/materials/student/${studentId}/`, {
              headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
              }
            });
            return {
              id: studentId,
              materials: response.data
            };
          })
        );

        handleClose();
        // Передаем обновленные данные в родительский компонент
        onMaterialsUpdate(updatedMaterials);
      } catch (error) {
        console.error('Ошибка при загрузке материалов:', error);
      }
    }
  };

  return (
    <div className="material-actions-container">
      <div className={`material-header ${type}-header`}>
        <span className="header-title">{getTitle()}</span>
        <button 
          className="add-material-btn"
          onClick={handleClick}
          title={`Добавить ${getTitle().toLowerCase()}`}
        >
          +
        </button>
      </div>
      {showUpload && type === 'materials' && (
        <UploadPanel 
          onUpload={handleUpload}
          onClose={handleClose}
        />
      )}
      {showDescription && type === 'tasks' && (
        <DescriptionPanel
          onSubmit={handleAddDescription}
          onClose={handleClose}
        />
      )}
      {showMessage && type === 'messages' && (
        <DescriptionPanel
          onSubmit={handleAddMessage}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export const MaterialCell = ({ materials = [] }) => {
  // Убедимся, что materials существует и является массивом
  const validMaterials = Array.isArray(materials) ? materials : [];

  return (
    <td className="add-material-column">
      {validMaterials.map((material, index) => (
        <span 
          key={material.id || index} 
          className="material-type-icon" 
          title={`${material.title}\n${material.description || ''}`}
          onClick={() => material.file_url && window.open(material.file_url, '_blank')}
          style={{ cursor: 'pointer' }}
        >
          {getFileIcon(material.material_type)}
        </span>
      ))}
    </td>
  );
};

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
