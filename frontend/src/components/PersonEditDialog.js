import React, { useState, useEffect } from 'react';
import './PersonEditDialog.css';

const PersonEditDialog = ({ person, isOpen, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    deathDate: '',
    location: '',
    occupation: '',
    notes: ''
  });

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name || '',
        birthDate: person.birthDate || '',
        deathDate: person.deathDate || '',
        location: person.location || '',
        occupation: person.occupation || '',
        notes: person.notes || ''
      });
    }
  }, [person]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Edit Person Details</h2>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        
        <form className="dialog-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="occupation">Occupation</label>
              <input
                id="occupation"
                type="text"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="Enter occupation"
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">Birth Date</label>
              <input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="deathDate">Death Date</label>
              <input
                id="deathDate"
                type="date"
                value={formData.deathDate}
                onChange={(e) => handleInputChange('deathDate', e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="location">Birth Location</label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter birth location"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this person"
                rows="3"
              />
            </div>
          </div>

          <div className="dialog-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonEditDialog;
