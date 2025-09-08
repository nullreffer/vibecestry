import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import './PersonNode.css';

const PersonNode = ({ data, id, onAddPerson }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddPerson = (direction) => {
    if (onAddPerson) {
      onAddPerson(id, direction);
    }
  };

  return (
    <div 
      className="person-node"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="person-handle"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="person-handle"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="person-handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="person-handle"
      />

      {/* Person Content */}
      <div className="person-content">
        <div className="person-photo">
          {data.photo ? (
            <img src={data.photo} alt={data.name} />
          ) : (
            <div className="person-initials">
              {data.name ? data.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
            </div>
          )}
        </div>
        <div className="person-info">
          <div className="person-name">{data.name || 'Unknown'}</div>
          <div className="person-dates">
            {data.birthDate && (
              <span className="birth-date">b. {data.birthDate}</span>
            )}
            {data.deathDate && (
              <span className="death-date">d. {data.deathDate}</span>
            )}
          </div>
          {data.location && (
            <div className="person-location">{data.location}</div>
          )}
        </div>
      </div>

      {/* Hover Action Buttons */}
      {isHovered && (
        <div className="action-buttons">
          {/* Add Parent Button */}
          <button
            className="action-button add-parent"
            onClick={() => handleAddPerson('parent')}
            title="Add Parent"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
            </svg>
          </button>

          {/* Add Spouse Left Button */}
          <button
            className="action-button add-spouse-left"
            onClick={() => handleAddPerson('spouse-left')}
            title="Add Spouse"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.5 2.5A2.5 2.5 0 0 0 6 5v6a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5V5a2.5 2.5 0 0 0-5 0v6a1.5 1.5 0 0 0 1.5 1.5h4A1.5 1.5 0 0 0 3 11V5a1.5 1.5 0 0 1 3 0v6a1.5 1.5 0 0 0 1.5 1.5h4A1.5 1.5 0 0 0 13 11V5a1.5 1.5 0 0 1 3 0v6a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5V5a2.5 2.5 0 0 0-2.5-2.5z"/>
            </svg>
          </button>

          {/* Add Spouse Right Button */}
          <button
            className="action-button add-spouse-right"
            onClick={() => handleAddPerson('spouse-right')}
            title="Add Spouse"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.5 2.5A2.5 2.5 0 0 0 6 5v6a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5V5a2.5 2.5 0 0 0-5 0v6a1.5 1.5 0 0 0 1.5 1.5h4A1.5 1.5 0 0 0 3 11V5a1.5 1.5 0 0 1 3 0v6a1.5 1.5 0 0 0 1.5 1.5h4A1.5 1.5 0 0 0 13 11V5a1.5 1.5 0 0 1 3 0v6a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5V5a2.5 2.5 0 0 0-2.5-2.5z"/>
            </svg>
          </button>

          {/* Add Child Button */}
          <button
            className="action-button add-child"
            onClick={() => handleAddPerson('child')}
            title="Add Child"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonNode;
