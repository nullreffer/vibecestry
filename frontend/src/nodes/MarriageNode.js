import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import './MarriageNode.css';

const MarriageNode = ({ id, data, selected }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = () => {
    if (data.onEdit) {
      data.onEdit(id, data);
    }
    setIsMenuOpen(false);
  };

  const handleAddChild = () => {
    if (data.onAddChild) {
      data.onAddChild(id, data);
    }
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
    setIsMenuOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getMarriageStatus = () => {
    if (data.separationDate) {
      return `Separated ${formatDate(data.separationDate)}`;
    }
    if (data.marriageDate) {
      return `Married ${formatDate(data.marriageDate)}`;
    }
    return 'Marriage';
  };

  return (
    <div className={`marriage-node ${selected ? 'selected' : ''}`} onClick={handleClick}>
      {/* Connection handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top" 
        className="marriage-handle"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom" 
        className="marriage-handle"
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left" 
        className="marriage-handle"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right" 
        className="marriage-handle"
      />

      <div className="marriage-content">
        <div className="marriage-header">
          <span className="marriage-icon">💒</span>
          <div className="marriage-title">{getMarriageStatus()}</div>
        </div>

        <div className="marriage-details">
          <div className="spouse-info">
            <div className="husband-info">
              <span className="spouse-label">👨 Husband:</span>
              <span className="spouse-name">{data.husbandName || 'Unknown'}</span>
            </div>
            <div className="wife-info">
              <span className="spouse-label">👩 Wife:</span>
              <span className="spouse-name">{data.wifeName || 'Unknown'}</span>
            </div>
          </div>

          {data.marriageDate && (
            <div className="marriage-date">
              <span className="date-label">📅 {formatDate(data.marriageDate)}</span>
            </div>
          )}

          {data.separationDate && (
            <div className="separation-date">
              <span className="date-label">💔 {formatDate(data.separationDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {isMenuOpen && (
        <div className="marriage-menu">
          <button className="marriage-menu-item edit-btn" onClick={handleEdit}>
            ✏️ Edit Marriage
          </button>
          <button className="marriage-menu-item add-child-btn" onClick={handleAddChild}>
            👶 Add Child
          </button>
          <button className="marriage-menu-item delete-btn" onClick={handleDelete}>
            🗑️ Delete Marriage
          </button>
        </div>
      )}
    </div>
  );
};

export default MarriageNode;