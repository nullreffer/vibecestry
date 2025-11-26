import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ProfileSettings from '../components/ProfileSettings';
import StorageSettings from '../components/StorageSettings';
import './Settings.css';

const Settings = () => {
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const isActive = (path) => {
    return location.pathname === path ? 'settings-nav-link active' : 'settings-nav-link';
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account preferences and data storage options</p>
        </div>

        <div className="settings-content">
          <nav className="settings-sidebar">
            <ul className="settings-nav">
              <li>
                <Link 
                  to="/settings/profile" 
                  className={isActive('/settings/profile')}
                >
                  <span className="nav-icon">👤</span>
                  Profile
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings/storage" 
                  className={isActive('/settings/storage')}
                >
                  <span className="nav-icon">💾</span>
                  Storage
                </Link>
              </li>
            </ul>
          </nav>

          <main className="settings-main">
            <Routes>
              <Route 
                path="profile" 
                element={
                  <ProfileSettings 
                    settings={settings} 
                    onSettingsUpdate={setSettings}
                  />
                } 
              />
              <Route 
                path="storage" 
                element={
                  <StorageSettings 
                    settings={settings} 
                    onSettingsUpdate={setSettings}
                  />
                } 
              />
              <Route 
                path="/" 
                element={
                  <div className="settings-welcome">
                    <h2>Welcome to Settings</h2>
                    <p>Select a category from the sidebar to manage your preferences.</p>
                    <div className="settings-overview">
                      <div className="overview-item">
                        <span className="overview-icon">👤</span>
                        <div>
                          <h3>Profile</h3>
                          <p>Update your name and profile picture</p>
                        </div>
                      </div>
                      <div className="overview-item">
                        <span className="overview-icon">💾</span>
                        <div>
                          <h3>Storage</h3>
                          <p>Choose where to save your family trees</p>
                        </div>
                      </div>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;