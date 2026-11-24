import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Alert from '../components/Alert';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/');

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate(destination, { replace: true });
  }, [user, destination, navigate]);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const data = await api.post('/auth/login', { email: form.email.trim(), password: form.password });
      login(data.token, data.user);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container section auth-section">
      <div className="card auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1>Log in</h1>
        <p className="muted">Use your account to apply for pets and track applications.</p>

        <Alert type="error" message={error} onClose={() => setError('')} />

        <form onSubmit={submit} noValidate>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" name="password" value={form.password} onChange={change} placeholder="Your password" autoComplete="current-password" />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>

        <div className="demo-box">
          <strong>Demo accounts</strong>
          <p>Admin: <code>admin@pets.com</code> / <code>admin123</code></p>
          <p>User: <code>user@pets.com</code> / <code>user123</code></p>
        </div>
      </div>
    </section>
  );
}
