import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { PLACEHOLDER_IMAGE } from '../constants';

export default function ApplyPage() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/pets/${id}`)
      .then((data) => { if (active) setPet(data.pet); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const submit = async (event) => {
    event.preventDefault();
    if (reason.trim().length < 10) {
      setError('Please write at least 10 characters about why you want to adopt this pet.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const data = await api.post('/applications', { pet_id: Number(id), reason: reason.trim() });
      setSuccess(data.message);
      setReason('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container section"><Loading label="Preparing application..." /></div>;

  if (error && !pet) {
    return (
      <div className="container section">
        <Alert type="error" message={error} />
        <Link to="/pets" className="btn btn-outline">Back to pets</Link>
      </div>
    );
  }

  return (
    <section className="container section apply-layout">
      <div className="page-heading">
        <span className="eyebrow">Adoption application</span>
        <h1>Apply to adopt {pet?.name}</h1>
        <p>Tell the admin a little about yourself and why you would be a good match.</p>
      </div>

      {success ? (
        <div className="card success-panel">
          <span className="success-icon" aria-hidden="true">✓</span>
          <h2>Application submitted!</h2>
          <p>{success} You can follow its status on the My Applications page.</p>
          <div className="form-actions">
            <Link to="/applications" className="btn btn-primary">View my applications</Link>
            <Link to="/pets" className="btn btn-outline">Browse more pets</Link>
          </div>
        </div>
      ) : (
        <div className="apply-grid">
          <div className="card pet-summary">
            <img
              src={pet?.image || PLACEHOLDER_IMAGE}
              alt={pet?.name || 'Pet'}
              onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
            />
            <div>
              <h2>{pet?.name}</h2>
              <p className="pet-meta">{pet?.type} · {pet?.breed}</p>
              <p className="pet-subtle">{pet?.age} years old · {pet?.gender}</p>
              <p>{pet?.description}</p>
              <span className={`badge badge-${pet?.status || 'available'}`}>{pet?.status}</span>
            </div>
          </div>

          <form className="card form-card" onSubmit={submit} noValidate>
            <h2>Your application</h2>
            <Alert type="error" message={error} onClose={() => setError('')} />

            {pet?.status !== 'available' && (
              <div className="notice">This pet is no longer available. You cannot submit a new application.</div>
            )}

            <label className="field">
              <span>Why do you want to adopt {pet?.name}? *</span>
              <textarea
                rows="7"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Describe your home, experience with pets, and why you are a good match..."
                maxLength={1000}
                disabled={pet?.status !== 'available'}
              />
              <small>{reason.trim().length}/1000 characters · minimum 10</small>
            </label>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting || pet?.status !== 'available'}>
                {submitting ? 'Submitting...' : 'Submit application'}
              </button>
              <Link to={`/pets/${id}`} className="btn btn-outline">Cancel</Link>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
