import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <div className="layout">
      <nav className="top-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <Link to="/" className="brand-link">
              Vibecestry
            </Link>
          </div>
          <div className="nav-links">
            <Link to="/" className={isActive('/')}>
              Flow List
            </Link>
            <Link to="/add" className={isActive('/add')}>
              Add Flow
            </Link>
            <Link to="/edit" className={isActive('/edit')}>
              Edit Flow
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
