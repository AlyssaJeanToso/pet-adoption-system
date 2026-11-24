import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Alert from '../components/Alert';

const EMPTY = { name: '', email: '', password: '', confirm: '' };

export default function RegisterPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.name.trim().length < 2) return setError('Please enter your name (at least 2 characters).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Please enter a valid email address.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setError('');
    setSubmitting(true);
    try {
      const data = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      login(data.token, data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container section auth-section">
      <div className="card auth-card">
        <span className="eyebrow">Join PawHome</span>
        <h1>Create an account</h1>
        <p className="muted">Registration creates a regular user account. Admin accounts are seeded for this project.</p>

        <Alert type="error" message={error} onClose={() => setError('')} />

        <form onSubmit={submit} noValidate>
          <label className="field">
            <span>Full name</span>
            <input name="name" value={form.name} onChange={change} placeholder="Your name" autoComplete="name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" name="password" value={form.password} onChange={change} placeholder="At least 6 characters" autoComplete="new-password" />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input type="password" name="confirm" value={form.confirm} onChange={change} placeholder="Repeat password" autoComplete="new-password" />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
      </div>
    </section>
  );
}
