import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'My Family Trees', subtitle: 'View and manage your ancestry charts' };
      case '/add':
        return { title: 'Create New Chart', subtitle: 'Build your family tree with interactive tools' };
      case '/edit':
      case location.pathname.startsWith('/edit/') ? location.pathname : '':
        return { title: 'Edit Family Tree', subtitle: 'Modify your ancestry chart and add family members' };
      default:
        return { title: 'Vibecestry', subtitle: 'Family tree builder' };
    }
  };

  const pageInfo = getPageInfo();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="layout">
      <nav className="top-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <Link to="/" className="brand-link">
              <span className="brand-icon">🌳</span>
              <span className="brand-text">Vibecestry</span>
            </Link>
          </div>
          
          <div className="page-info">
            <h1 className="page-title">{pageInfo.title}</h1>
            <p className="page-subtitle">{pageInfo.subtitle}</p>
          </div>

          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link 
              to="/" 
              className={isActive('/')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">📋</span>
              <span className="nav-text">Charts</span>
            </Link>
            <Link 
              to="/add" 
              className={isActive('/add')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">➕</span>
              <span className="nav-text">Create</span>
            </Link>
            <Link 
              to="/edit" 
              className={isActive('/edit')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">✏️</span>
              <span className="nav-text">Edit</span>
            </Link>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
