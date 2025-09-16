import React, { useState } from 'react';
import './PersonEditDialog.css';

const LinkRelationshipDialog = ({ isOpen, onSave, onCancel, sourcePerson, targetPerson }) => {
  const [relationshipType, setRelationshipType] = useState('biological-parent');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(relationshipType);
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
                <option value="biological-parent">{sourcePerson?.name} is {targetPerson?.name}'s Biological Parent</option>
                <option value="biological-child">{sourcePerson?.name} is {targetPerson?.name}'s Biological Child</option>
                <option value="adopted-parent">{sourcePerson?.name} is {targetPerson?.name}'s Adopted Parent</option>
                <option value="adopted-child">{sourcePerson?.name} is {targetPerson?.name}'s Adopted Child</option>
                <option value="spouse">{sourcePerson?.name} is {targetPerson?.name}'s Spouse</option>
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
