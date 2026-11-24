import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <strong>PawHome</strong>
          <p>Simple, caring pet adoption management.</p>
        </div>
        <div className="footer-links">
          <Link to="/pets">Browse pets</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </div>
        <span className="footer-copy">© {new Date().getFullYear()} PawHome. School project.</span>
      </div>
    </footer>
  );
}
