import React, { useState, useEffect } from 'react';
import './PersonEditDialog.css';

const PersonEditDialog = ({ person, isOpen, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    biologicalSex: 'male',
    birthDate: '',
    deathDate: '',
    location: '',
    occupation: '',
    notes: '',
    email: '',
    phone: '',
    photo: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (person) {
      const data = person.data || person;
      setFormData({
        name: data.name || '',
        biologicalSex: data.biologicalSex || 'male',
        birthDate: data.birthDate || '',
        deathDate: data.deathDate || '',
        location: data.location || '',
        occupation: data.occupation || '',
        notes: data.notes || '',
        email: data.email || '',
        phone: data.phone || '',
        photo: data.photo || ''
      });
      
      // Set photo preview if photo exists
      if (data.photo) {
        setPhotoPreview(data.photo);
      } else {
        setPhotoPreview(null);
      }
    }
  }, [person]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If there's a new photo file, we'll need to handle upload
    const dataToSave = { ...formData };
    if (photoFile) {
      // For now, we'll store the preview URL
      // In a real app, you'd upload the file to a server first
      dataToSave.photo = photoPreview;
    }
    
    onSave(dataToSave);
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
          {/* Photo Section */}
          <div className="photo-section">
            <div className="photo-preview">
              {photoPreview ? (
                <img src={photoPreview} alt="Person" className="person-photo" />
              ) : (
                <div className="photo-placeholder">
                  <span>📷</span>
                  <p>No photo</p>
                </div>
              )}
            </div>
            <div className="photo-upload">
              <label htmlFor="photo" className="upload-button">
                <span>📤</span>
                Choose Photo
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <p className="upload-hint">Upload a photo (max 5MB)</p>
            </div>
          </div>

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

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
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
