import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { formatDate, PLACEHOLDER_IMAGE } from '../constants';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/applications/mine')
      .then((data) => { if (active) setApplications(data.applications); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="container section">
      <div className="page-heading">
        <span className="eyebrow">Your activity</span>
        <h1>My applications</h1>
        <p>Track the status of every adoption application you have submitted.</p>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {loading ? (
        <Loading label="Loading applications..." />
      ) : applications.length ? (
        <div className="application-list">
          {applications.map((item) => (
            <article key={item.id} className="card application-row">
              <img
                className="application-thumb"
                src={item.pet_image || PLACEHOLDER_IMAGE}
                alt={item.pet_name}
                onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
              />
              <div className="application-main">
                <div className="application-title">
                  <h3>{item.pet_name}</h3>
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                </div>
                <p className="pet-subtle">{item.pet_type} · Applied {formatDate(item.created_at)}</p>
                <p className="application-reason">{item.reason}</p>
              </div>
              <div className="application-side">
                <span className="muted">Application #{item.id}</span>
                <Link to={`/pets/${item.pet_id}`} className="btn btn-outline btn-sm">View pet</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <span className="empty-icon" aria-hidden="true">📝</span>
          <h3>You have not applied yet</h3>
          <p>Find a pet you love and send your first application.</p>
          <Link to="/pets" className="btn btn-primary">Browse pets</Link>
        </div>
      )}
    </section>
  );
}
