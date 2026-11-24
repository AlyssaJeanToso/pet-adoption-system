import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="container section center-section">
      <span className="empty-icon" aria-hidden="true">🐾</span>
      <h1>Page not found</h1>
      <p className="muted">That page does not exist, but there are plenty of pets waiting for you.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </section>
  );
}
