import React, { useState } from 'react';
import { getRelationshipOptions, RELATIONSHIP_TYPES } from '../constants/relationships';
import './PersonEditDialog.css';

const LinkRelationshipDialog = ({ isOpen, onSave, onCancel, sourcePerson, targetPerson }) => {
  const [relationshipType, setRelationshipType] = useState(RELATIONSHIP_TYPES.BIOLOGICAL_PARENT);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(relationshipType);
    setRelationshipType(RELATIONSHIP_TYPES.BIOLOGICAL_PARENT);
  };

  const handleCancel = () => {
    setRelationshipType(RELATIONSHIP_TYPES.BIOLOGICAL_PARENT);
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Link Relationship</h2>
          <button className="close-button" onClick={handleCancel}>×</button>
        </div>
        
        <div className="dialog-form">
          <div className="link-preview">
            <div className="person-preview">
              <strong>{sourcePerson?.name || 'Unknown'}</strong>
              <span className="person-gender">({sourcePerson?.biologicalSex || 'Unknown'})</span>
            </div>
            <div className="link-arrow">→</div>
            <div className="person-preview">
              <strong>{targetPerson?.name || 'Unknown'}</strong>
              <span className="person-gender">({targetPerson?.biologicalSex || 'Unknown'})</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="relationshipType">
                How is <strong>{sourcePerson?.name}</strong> related to <strong>{targetPerson?.name}</strong>?
              </label>
              <select
                id="relationshipType"
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value)}
                required
              >
                {getRelationshipOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {sourcePerson?.name} is {targetPerson?.name}'s {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="dialog-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Create Link
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LinkRelationshipDialog;
