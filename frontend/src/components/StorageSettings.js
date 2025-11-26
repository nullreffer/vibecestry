import React, { useState } from 'react';
import './StorageSettings.css';

const StorageSettings = ({ settings, onSettingsUpdate }) => {
  const [storagePreference, setStoragePreference] = useState(
    settings?.storagePreference || 'mongo'
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleStorageChange = (e) => {
    setStoragePreference(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:3001/api/settings/storage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ storagePreference })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Storage preference updated successfully!', type: 'success' });
        onSettingsUpdate(data.settings);
      } else {
        setMessage({ text: data.error || 'Failed to update storage preference', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating storage preference:', error);
      setMessage({ text: 'Failed to update storage preference', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="storage-settings">
      <div className="storage-header">
        <h2>Storage Settings</h2>
        <p>Choose where your family tree data should be stored</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="storage-form">
        <div className="storage-options">
          <div className="storage-option">
            <input
              type="radio"
              id="mongo"
              name="storage"
              value="mongo"
              checked={storagePreference === 'mongo'}
              onChange={handleStorageChange}
              className="radio-input"
            />
            <label htmlFor="mongo" className="option-label">
              <div className="option-header">
                <span className="option-icon">🗄️</span>
                <div className="option-title">
                  <h3>MongoDB Cloud</h3>
                  <span className="option-badge recommended">Recommended</span>
                </div>
              </div>
              <p className="option-description">
                Store your family trees securely in our cloud database. Fast, reliable, 
                and automatically backed up. Your data is encrypted and only accessible to you.
              </p>
              <ul className="option-features">
                <li>✅ Automatic backups</li>
                <li>✅ Fast sync across devices</li>
                <li>✅ Secure encryption</li>
                <li>✅ No setup required</li>
              </ul>
            </label>
          </div>

          <div className="storage-option">
            <input
              type="radio"
              id="googledrive"
              name="storage"
              value="googledrive"
              checked={storagePreference === 'googledrive'}
              onChange={handleStorageChange}
              className="radio-input"
            />
            <label htmlFor="googledrive" className="option-label">
              <div className="option-header">
                <span className="option-icon">📁</span>
                <div className="option-title">
                  <h3>Google Drive</h3>
                  <span className="option-badge">Coming Soon</span>
                </div>
              </div>
              <p className="option-description">
                Save your family trees directly to your Google Drive. You have full control 
                over your data and can access files directly from your Google Drive.
              </p>
              <ul className="option-features">
                <li>🔄 Manual sync required</li>
                <li>💾 Uses your Drive storage</li>
                <li>🔒 Full data ownership</li>
                <li>⚙️ Additional setup needed</li>
              </ul>
              <div className="coming-soon-notice">
                <strong>Note:</strong> Google Drive integration is currently under development 
                and will be available in a future update.
              </div>
            </label>
          </div>
        </div>

        <div className="storage-info">
          <div className="info-box">
            <h4>📊 Current Usage</h4>
            <p>You have created <strong>0 family trees</strong> using the current storage method.</p>
          </div>
          
          <div className="info-box">
            <h4>🔄 Switching Storage</h4>
            <p>
              Changing your storage preference will affect where new family trees are saved. 
              Existing trees will remain in their current location until manually migrated.
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading || storagePreference === 'googledrive'}
            className="save-button"
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Saving...
              </>
            ) : (
              'Save Storage Preference'
            )}
          </button>
          
          {storagePreference === 'googledrive' && (
            <p className="disabled-notice">
              Google Drive option is not available yet. Please select MongoDB for now.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default StorageSettings;