import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { formatDate } from '../constants';

export default function ManageApplicationsPage() {
  const [status, setStatus] = useState('all');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/applications?status=${status}`);
      setApplications(data.applications);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const decide = async (id, newStatus) => {
    setUpdatingId(id);
    setFeedback({ type: '', message: '' });
    try {
      const data = await api.put(`/applications/${id}/status`, { status: newStatus });
      setFeedback({ type: 'success', message: data.message });
      await load();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="container section">
      <div className="page-heading admin-heading">
        <div>
          <span className="eyebrow">Admin area</span>
          <h1>Manage applications</h1>
          <p>Approve or reject adoption requests. Approving a request marks its pet as adopted.</p>
        </div>
        <div className="quick-actions">
          <Link to="/admin" className="btn btn-outline">Back to dashboard</Link>
        </div>
      </div>

      <div className="filter-bar card">
        <label className="field">
          <span>Filter by status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All applications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      <Alert
        type={feedback.type || 'info'}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      {loading ? (
        <Loading label="Loading applications..." />
      ) : applications.length ? (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Applicant</th><th>Pet</th><th>Reason</th><th>Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.user_name}</strong>
                    <small className="table-sub">{item.user_email}</small>
                  </td>
                  <td><strong>{item.pet_name}</strong><small className="table-sub">#{item.id}</small></td>
                  <td className="reason-cell" title={item.reason}>{item.reason}</td>
                  <td>{formatDate(item.created_at)}</td>
                  <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                  <td>
                    {item.status === 'pending' ? (
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={updatingId === item.id}
                          onClick={() => decide(item.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          disabled={updatingId === item.id}
                          onClick={() => decide(item.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="muted">Decided</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state card">
          <h3>No applications to show</h3>
          <p>Try a different status filter.</p>
        </div>
      )}
    </section>
  );
}
