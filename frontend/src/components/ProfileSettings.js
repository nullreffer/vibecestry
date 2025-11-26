import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ProfileSettings.css';

const ProfileSettings = ({ settings, onSettingsUpdate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: settings?.name || user?.name || '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const response = await fetch('http://localhost:3001/api/settings/profile', {
        method: 'PUT',
        credentials: 'include',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        onSettingsUpdate(data.settings);
        setProfileImage(null);
        setPreviewUrl(null);
      } else {
        setMessage({ text: data.error || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentProfileImage = () => {
    if (previewUrl) return previewUrl;
    if (settings?.customProfileImage) return `http://localhost:3001${settings.customProfileImage}`;
    return user?.picture || '';
  };

  return (
    <div className="profile-settings">
      <div className="profile-header">
        <h2>Profile Settings</h2>
        <p>Update your personal information and profile picture</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-image-section">
          <div className="current-image">
            <img 
              src={getCurrentProfileImage()} 
              alt="Profile" 
              className="profile-preview"
            />
          </div>
          <div className="image-upload">
            <label htmlFor="profileImage" className="upload-label">
              <span>📷</span>
              Change Photo
            </label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <p className="upload-hint">
              Upload a new profile picture (max 5MB)
            </p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="name">Display Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="form-input"
            placeholder="Enter your display name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={user?.email || ''}
            disabled
            className="form-input disabled"
            placeholder="Email from Google account"
          />
          <p className="field-hint">
            Email is managed by your Google account and cannot be changed here.
          </p>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading}
            className="save-button"
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;