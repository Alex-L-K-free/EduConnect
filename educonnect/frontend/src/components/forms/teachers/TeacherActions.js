import React, { useState } from 'react';
import ActionModal from './TeacherActionModal';
import './TeacherActions.css';

const StudentActions = ({ students, selectedStudents }) => {
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

export default StudentActions;
