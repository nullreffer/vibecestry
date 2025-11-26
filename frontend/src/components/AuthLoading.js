import React from 'react';
import './AuthLoading.css';

const AuthLoading = () => {
  return (
    <div className="auth-loading">
      <div className="auth-loading-content">
        <div className="spinner"></div>
        <h2>Vibecestry</h2>
        <p>Checking authentication status...</p>
      </div>
    </div>
  );
};

export default AuthLoading;