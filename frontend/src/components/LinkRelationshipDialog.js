import React, { useState } from 'react';
import { getSimplifiedRelationshipOptions, RELATIONSHIP_TYPES } from '../constants/relationships';
import './PersonEditDialog.css';

const LinkRelationshipDialog = ({ isOpen, onSave, onCancel, sourcePerson, targetPerson }) => {
  const [relationshipType, setRelationshipType] = useState('biological-parent');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Find the selected relationship option to get the actual relationship type
    const selectedOption = getSimplifiedRelationshipOptions().find(option => option.value === relationshipType);
    const actualRelationshipType = selectedOption ? selectedOption.relationshipType : RELATIONSHIP_TYPES.BIOLOGICAL_PARENT_CHILD;
    
    // Determine the direction for parent-child relationships
    let relationshipDirection = 'bidirectional';
    if (relationshipType.includes('parent')) {
      relationshipDirection = 'parent-to-child';
    } else if (relationshipType.includes('child')) {
      relationshipDirection = 'child-to-parent';
    }
    
    onSave({
      relationshipType: actualRelationshipType,
      relationshipDirection
    });
    setRelationshipType('biological-parent');
  };

  const handleCancel = () => {
    setRelationshipType('biological-parent');
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
                {getSimplifiedRelationshipOptions().map(option => {
                  // Create clearer labels for the relationship direction
                  let displayLabel = '';
                  if (option.value.includes('parent')) {
                    displayLabel = `${sourcePerson?.name} is ${targetPerson?.name}'s ${option.label.replace(' (', ' ').replace(')', '')}`;
                  } else if (option.value.includes('child')) {
                    displayLabel = `${sourcePerson?.name} is ${targetPerson?.name}'s ${option.label.replace(' (', ' ').replace(')', '')}`;
                  } else {
                    displayLabel = `${sourcePerson?.name} is ${targetPerson?.name}'s ${option.label}`;
                  }
                  
                  return (
                    <option key={option.value} value={option.value}>
                      {displayLabel}
                    </option>
                  );
                })}
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
