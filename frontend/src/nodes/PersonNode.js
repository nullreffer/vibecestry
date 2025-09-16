import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import './PersonNode.css';

const PersonNode = ({ data, id }) => {
  const [showActions, setShowActions] = useState(false);

  const handleAddRelative = () => {
    if (data.onAddRelative) {
      data.onAddRelative(id, data);
    }
    setShowActions(false);
  };

  const handleLinkRelative = () => {
    if (data.onLink) {
      data.onLink(id, data);
    }
    setShowActions(false);
  };

  const handleDoubleClick = () => {
    if (data.onEdit) {
      data.onEdit(id, data);
    }
  };

  const handleNodeClick = (e) => {
    e.stopPropagation();
    
    // If in linking mode and this isn't the source node, call the parent's linking handler
    if (data.isLinkingMode && data.linkingSourceId !== id && data.onNodeClickForLinking) {
      data.onNodeClickForLinking(e, { id, data });
      return;
    }
    
    // Otherwise, toggle actions panel
    setShowActions(!showActions);
  };

  const handleEditPerson = () => {
    if (data.onEdit) {
      data.onEdit(id, data);
    }
    setShowActions(false);
  };

  const handleDeletePerson = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
    setShowActions(false);
  };

  return (
    <div 
      className={`person-node ${data.biologicalSex === 'female' ? 'female' : 'male'}${
        data.isLinkingMode && data.linkingSourceId !== id ? ' linking-mode' : ''
      }${data.isLinkingSource ? ' linking-source' : ''}`}
      onClick={handleNodeClick}
      onDoubleClick={handleDoubleClick}
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

      {/* Click Action Buttons */}
      {showActions && (
        <div className="action-panel">
          <div className="action-row">
            <button
              className="action-btn add-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAddRelative();
              }}
              title="Add Relative"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              Add Relative
            </button>
          </div>
          
          <div className="action-row">
            <button
              className="action-btn edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleEditPerson();
              }}
              title="Edit Person"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L10.5 8.5 7.5 5.5 12.146.146zM11.207 1.207 7.5 4.914 8.086 5.5l3.707-3.707-.586-.586zM1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
              </svg>
              Edit Person
            </button>
            
            <button
              className="action-btn delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePerson();
              }}
              title="Delete Person"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
              </svg>
              Delete Person
            </button>
          </div>
          
          <div className="action-row">
            <button
              className="action-btn link-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleLinkRelative();
              }}
              title="Link to Relative"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
              </svg>
              Link Relative
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonNode;
