import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { formatDate } from '../constants';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/admin/dashboard')
      .then((result) => { if (active) setData(result); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, []);

  const stats = data?.stats;

  return (
    <section className="container section">
      <div className="page-heading admin-heading">
        <div>
          <span className="eyebrow">Admin area</span>
          <h1>Dashboard</h1>
          <p>A quick overview of pets, users and adoption requests.</p>
        </div>
        <div className="quick-actions">
          <Link to="/admin/pets" className="btn btn-primary">Manage pets</Link>
          <Link to="/admin/applications" className="btn btn-outline">Review applications</Link>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {!data ? (
        <Loading label="Loading dashboard..." />
      ) : (
        <>
          <div className="stats-grid">
            <div className="card stat-card"><span>Total pets</span><strong>{stats.totalPets}</strong></div>
            <div className="card stat-card"><span>Available pets</span><strong>{stats.availablePets}</strong></div>
            <div className="card stat-card"><span>Adopted pets</span><strong>{stats.adoptedPets}</strong></div>
            <div className="card stat-card"><span>Adoption requests</span><strong>{stats.totalApplications}</strong></div>
            <div className="card stat-card"><span>Pending</span><strong>{stats.pending}</strong></div>
            <div className="card stat-card"><span>Approved</span><strong>{stats.approved}</strong></div>
            <div className="card stat-card"><span>Rejected</span><strong>{stats.rejected}</strong></div>
            <div className="card stat-card"><span>Registered users</span><strong>{stats.totalUsers}</strong></div>
          </div>

          <div className="card recent-panel">
            <div className="panel-heading">
              <h2>Recent applications</h2>
              <Link to="/admin/applications" className="text-link">View all →</Link>
            </div>
            {data.recentApplications.length ? (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Applicant</th><th>Pet</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {data.recentApplications.map((item) => (
                      <tr key={item.id}>
                        <td>{item.user_name}</td>
                        <td>{item.pet_name}</td>
                        <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                        <td>{formatDate(item.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">No applications have been submitted yet.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
