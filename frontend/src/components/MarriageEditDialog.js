import React, { useState, useEffect } from 'react';
import './PersonEditDialog.css';

const MarriageEditDialog = ({ 
  isOpen, 
  onSave, 
  onCancel, 
  marriageData = {}, 
  availablePeople = [],
  sourcePerson = null  // New prop for pre-populating from Add Spouse
}) => {
  const [formData, setFormData] = useState({
    husbandId: '',
    husbandName: '',
    wifeId: '',
    wifeName: '',
    marriageDate: '',
    separationDate: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (marriageData && Object.keys(marriageData).length > 0) {
        // Editing existing marriage
        setFormData({
          husbandId: marriageData.husbandId || '',
          husbandName: marriageData.husbandName || '',
          wifeId: marriageData.wifeId || '',
          wifeName: marriageData.wifeName || '',
          marriageDate: marriageData.marriageDate || '',
          separationDate: marriageData.separationDate || '',
          location: marriageData.location || '',
          notes: marriageData.notes || ''
        });
      } else if (sourcePerson) {
        // Creating new marriage from Add Spouse
        const initialData = {
          husbandId: '',
          husbandName: '',
          wifeId: '',
          wifeName: '',
          marriageDate: '',
          separationDate: '',
          location: '',
          notes: ''
        };
        
        // Pre-populate based on source person's gender
        if (sourcePerson.biologicalSex === 'male') {
          initialData.husbandId = sourcePerson.id;
          initialData.husbandName = sourcePerson.name;
        } else {
          initialData.wifeId = sourcePerson.id;
          initialData.wifeName = sourcePerson.name;
        }
        
        setFormData(initialData);
      } else {
        // Creating new marriage from scratch
        setFormData({
          husbandId: '',
          husbandName: '',
          wifeId: '',
          wifeName: '',
          marriageDate: '',
          separationDate: '',
          location: '',
          notes: ''
        });
      }
    }
  }, [isOpen, marriageData, sourcePerson]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update name when ID changes
    if (field === 'husbandId') {
      const husband = availablePeople.find(p => p.id === value);
      setFormData(prev => ({
        ...prev,
        husbandName: husband ? husband.data.name : ''
      }));
    } else if (field === 'wifeId') {
      const wife = availablePeople.find(p => p.id === value);
      setFormData(prev => ({
        ...prev,
        wifeName: wife ? wife.data.name : ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    // Reset form
    setFormData({
      husbandId: '',
      husbandName: '',
      wifeId: '',
      wifeName: '',
      marriageDate: '',
      separationDate: '',
      location: '',
      notes: ''
    });
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      husbandId: '',
      husbandName: '',
      wifeId: '',
      wifeName: '',
      marriageDate: '',
      separationDate: '',
      location: '',
      notes: ''
    });
    onCancel();
  };

  // Filter available people by gender
  const availableMen = availablePeople.filter(person => 
    person.data.biologicalSex === 'male' && person.id !== formData.wifeId
  );
  
  const availableWomen = availablePeople.filter(person => 
    person.data.biologicalSex === 'female' && person.id !== formData.husbandId
  );

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>💒 {marriageData?.husbandName ? 'Edit Marriage' : 'Create Marriage'}</h2>
          <button className="close-button" onClick={handleCancel}>×</button>
        </div>
        
        <form className="dialog-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="husbandId">Husband *</label>
              {sourcePerson && sourcePerson.biologicalSex === 'male' ? (
                // Source person is male, show as readonly
                <input
                  type="text"
                  value={formData.husbandName}
                  disabled
                  style={{ background: '#f5f5f5', color: '#666' }}
                />
              ) : sourcePerson && sourcePerson.biologicalSex === 'female' ? (
                // Source person is female, allow text input for new husband
                <input
                  type="text"
                  id="husbandName"
                  value={formData.husbandName}
                  onChange={(e) => handleInputChange('husbandName', e.target.value)}
                  placeholder="Enter new husband's name"
                  required
                />
              ) : (
                // Normal dropdown selection for existing people
                <select
                  id="husbandId"
                  value={formData.husbandId}
                  onChange={(e) => handleInputChange('husbandId', e.target.value)}
                  required
                >
                  <option value="">Select Husband</option>
                  {availableMen.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.data.name}
                      {person.data.birthDate && ` (born ${new Date(person.data.birthDate).getFullYear()})`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="wifeId">Wife *</label>
              {sourcePerson && sourcePerson.biologicalSex === 'female' ? (
                // Source person is female, show as readonly
                <input
                  type="text"
                  value={formData.wifeName}
                  disabled
                  style={{ background: '#f5f5f5', color: '#666' }}
                />
              ) : sourcePerson && sourcePerson.biologicalSex === 'male' ? (
                // Source person is male, allow text input for new wife
                <input
                  type="text"
                  id="wifeName"
                  value={formData.wifeName}
                  onChange={(e) => handleInputChange('wifeName', e.target.value)}
                  placeholder="Enter new wife's name"
                  required
                />
              ) : (
                // Normal dropdown selection for existing people
                <select
                  id="wifeId"
                  value={formData.wifeId}
                  onChange={(e) => handleInputChange('wifeId', e.target.value)}
                  required
                >
                  <option value="">Select Wife</option>
                  {availableWomen.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.data.name}
                      {person.data.birthDate && ` (born ${new Date(person.data.birthDate).getFullYear()})`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="marriageDate">Marriage Date</label>
              <input
                id="marriageDate"
                type="date"
                value={formData.marriageDate}
                onChange={(e) => handleInputChange('marriageDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="separationDate">Separation Date</label>
              <input
                id="separationDate"
                type="date"
                value={formData.separationDate}
                onChange={(e) => handleInputChange('separationDate', e.target.value)}
                min={formData.marriageDate}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="location">Marriage Location</label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter marriage location"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this marriage"
                rows="3"
              />
            </div>
          </div>

          <div className="dialog-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {marriageData?.husbandName ? 'Update Marriage' : 'Create Marriage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarriageEditDialog;