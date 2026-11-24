import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  const navClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Main navigation">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark" aria-hidden="true">🐾</span>
          <span>PawHome</span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          ☰
        </button>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" className={navClass} onClick={close} end>Home</NavLink>
          <NavLink to="/pets" className={navClass} onClick={close}>Pets</NavLink>

          {isAuthenticated && !isAdmin && (
            <NavLink to="/applications" className={navClass} onClick={close}>My Applications</NavLink>
          )}
          {isAdmin && (
            <>
              <NavLink to="/admin" className={navClass} onClick={close}>Dashboard</NavLink>
              <NavLink to="/admin/pets" className={navClass} onClick={close}>Manage Pets</NavLink>
              <NavLink to="/admin/applications" className={navClass} onClick={close}>Applications</NavLink>
            </>
          )}

          <span className="nav-spacer" />

          {isAuthenticated ? (
            <>
              <span className="nav-user">Hi, {user?.name?.split(' ')[0] || 'there'}</span>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass} onClick={close}>Login</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
