import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeacherActions.css';

const UploadPanel = ({ onUpload, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState('');
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onUpload(files, description);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '*/*';
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      onUpload(files, description);
    };
    input.click();
  };

  return (
    <div className="quick-add-panel" onClick={e => e.stopPropagation()}>
      <div className="upload-description-zone">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Добавьте описание или задание к материалу"
          className="upload-description"
        />
      </div>
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

  const handleUpload = async (files, description) => {
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
        formData.append('description', description); // Добавляем описание

        await axios.post('/api/v1/materials/add/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });

        handleClose();
        if (typeof onMaterialsUpdate === 'function') {
          onMaterialsUpdate(null, true);
        }
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

export const MaterialCell = ({ materials = [], onMaterialsUpdate, studentId }) => {
  const [localMaterials, setLocalMaterials] = useState(materials);
  const [activeItem, setActiveItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Обновляем локальное состояние при изменении props
  useEffect(() => {
    setLocalMaterials(materials);
  }, [materials]);

  const handleDelete = async (materialId, e) => {
    e.stopPropagation();
    if (deletingItem === materialId) {
      // Выполняем удаление если это повторное нажатие
      try {
        const response = await axios.delete(`/api/v1/materials/delete/${materialId}/`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });
        
        if (response.status === 204) {
          const updatedMaterials = localMaterials.filter(material => material.id !== materialId);
          setLocalMaterials(updatedMaterials);
          if (typeof onMaterialsUpdate === 'function') {
            onMaterialsUpdate({
              studentId,
              materials: updatedMaterials
            });
          }
        }
      } catch (error) {
        console.error('Ошибка при удалении материала:', error);
        alert('Не удалось удалить материал. Пожалуйста, попробуйте снова.');
      }
      setDeletingItem(null);
    } else {
      // Первое нажатие - запрос подтверждения
      setDeletingItem(materialId);
    }
  };

  // Сбрасываем состояние подтверждения удаления при смене активного элемента
  useEffect(() => {
    setDeletingItem(null);
  }, [activeItem]);

  const handleView = (e, material) => {
    e.stopPropagation();
    if (material.file_url) {
      window.open(material.file_url, '_blank');
    }
  };

  const handleDownload = async (e, material) => {
    e.stopPropagation();
    if (material.file_url) {
      try {
        const response = await axios({
          url: material.file_url,
          method: 'GET',
          responseType: 'blob',
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });

        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', material.title); // Используем оригинальное имя файла
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Ошибка при скачивании файла:', error);
        alert('Не удалось скачать файл. Пожалуйста, попробуйте снова.');
      }
    }
  };

  const handleIconClick = (materialId, e) => {
    e.stopPropagation();
    if (activeItem === materialId) {
      setActiveItem(null);
    } else {
      setActiveItem(materialId);
    }
  };

  // Обработчик клика вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.material-item-wrapper')) {
        setActiveItem(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <td className="add-material-column">
      {localMaterials.map((material, index) => (
        <div 
          key={material.id || index} 
          className={`material-item-wrapper ${activeItem === material.id ? 'active' : ''}`}
        >
          <span 
            className="material-type-icon"
            title={`${material.title}${material.description ? '\n\nОписание:\n' + material.description : ''}`}
            onClick={(e) => handleIconClick(material.id, e)}
          >
            {getFileIcon(material.material_type)}
          </span>
          <div className={`material-actions-overlay ${activeItem === material.id ? 'visible' : ''}`}>
            {material.file_url && (
              <>
                <button 
                  className="material-action-btn view-btn"
                  onClick={(e) => handleView(e, material)}
                >
                  Просмотр
                </button>
                <button 
                  className="material-action-btn download-btn"
                  onClick={(e) => handleDownload(e, material)}
                >
                  Скачать
                </button>
              </>
            )}
            <button 
              className={`material-action-btn delete-btn ${deletingItem === material.id ? 'confirm-delete' : ''}`}
              onClick={(e) => handleDelete(material.id, e)}
            >
              {deletingItem === material.id ? 'Подтвердить' : 'Удалить'}
            </button>
          </div>
        </div>
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
