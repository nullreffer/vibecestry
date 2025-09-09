import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import './PersonNode.css';

const PersonNode = ({ data, id }) => {
  const [showActions, setShowActions] = useState(false);

  const handleAddPerson = (direction) => {
    if (data.onAddPerson) {
      data.onAddPerson(id, direction);
    }
  };

  const handleDoubleClick = () => {
    if (data.onEdit) {
      data.onEdit(id, data);
    }
  };

  const handleNodeClick = (e) => {
    e.stopPropagation();
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

  const handleLinkPerson = (relationship) => {
    if (data.onLink) {
      data.onLink(id, relationship);
    }
    setShowActions(false);
  };

  return (
    <div 
      className="person-node"
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
                handleAddPerson('parent');
              }}
              title="Add Parent"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1L6.5 2.5 8 4l1.5-1.5L8 1zM5 5.5C5 4.7 5.7 4 6.5 4h3c.8 0 1.5.7 1.5 1.5v1c0 .6-.4 1.1-1 1.4v1.6c0 .8-.7 1.5-1.5 1.5h-1C6.7 11 6 10.3 6 9.5V7.9c-.6-.3-1-.8-1-1.4v-1z"/>
              </svg>
              Add Parent
            </button>
            
            <button
              className="action-btn add-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAddPerson('child');
              }}
              title="Add Child"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-1a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                <path d="M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13z"/>
              </svg>
              Add Child
            </button>
            
            <button
              className="action-btn add-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleAddPerson('spouse-right');
              }}
              title="Add Spouse"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 2a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm6 6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v4h2V9h1v3h2V9h1v3h2V8z"/>
                <circle cx="13" cy="13" r="2"/>
              </svg>
              Add Spouse
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
                handleLinkPerson('parent');
              }}
              title="Link to Parent"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
              </svg>
              Link Parent
            </button>
            
            <button
              className="action-btn link-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleLinkPerson('child');
              }}
              title="Link to Child"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
              </svg>
              Link Child
            </button>
            
            <button
              className="action-btn link-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleLinkPerson('spouse');
              }}
              title="Link to Spouse"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
              </svg>
              Link Spouse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonNode;
