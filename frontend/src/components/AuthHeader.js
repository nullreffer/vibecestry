import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthHeader.css';

const AuthHeader = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  return (
    <div className="auth-header">
      <div className="auth-header-content">
        <div className="logo">
          <span>🌳 Vibecestry</span>
        </div>
        
        <div className="user-menu">
          <div 
            className="user-avatar"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img src={user.picture} alt={user.name} />
            <span className="user-name">{user.name}</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item user-info">
                <div className="user-details">
                  <div className="user-full-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-btn" onClick={handleLogout}>
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthHeader;