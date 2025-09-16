import React, { useState } from 'react';
import './PersonEditDialog.css';

const AddRelativeDialog = ({ isOpen, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    biologicalSex: 'male',
    relationshipType: 'biological-parent',
    birthDate: '',
    deathDate: '',
    location: '',
    occupation: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    // Reset form
    setFormData({
      name: '',
      biologicalSex: 'male',
      relationshipType: 'biological-parent',
      birthDate: '',
      deathDate: '',
      location: '',
      occupation: '',
      notes: ''
    });
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: '',
      biologicalSex: 'male',
      relationshipType: 'biological-parent',
      birthDate: '',
      deathDate: '',
      location: '',
      occupation: '',
      notes: ''
    });
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Add New Relative</h2>
          <button className="close-button" onClick={handleCancel}>×</button>
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
              <label htmlFor="biologicalSex">Biological Sex *</label>
              <select
                id="biologicalSex"
                value={formData.biologicalSex}
                onChange={(e) => handleInputChange('biologicalSex', e.target.value)}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="relationshipType">Relationship Type *</label>
              <select
                id="relationshipType"
                value={formData.relationshipType}
                onChange={(e) => handleInputChange('relationshipType', e.target.value)}
                required
              >
                <option value="biological-parent">Biological Parent</option>
                <option value="biological-child">Biological Child</option>
                <option value="adopted-parent">Adopted Parent</option>
                <option value="adopted-child">Adopted Child</option>
                <option value="spouse">Spouse</option>
              </select>
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
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Add Relative
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRelativeDialog;
