import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { PLACEHOLDER_IMAGE } from '../constants';

export default function PetDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/pets/${id}`)
      .then((data) => { if (active) setPet(data.pet); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="container section"><Loading label="Loading pet profile..." /></div>;

  if (error || !pet) {
    return (
      <div className="container section">
        <Alert type="error" message={error || 'Pet not found.'} />
        <Link to="/pets" className="btn btn-outline">Back to pets</Link>
      </div>
    );
  }

  return (
    <section className="container section">
      <Link to="/pets" className="back-link">← Back to all pets</Link>

      <div className="detail-layout">
        <div className="detail-image card">
          <img
            src={pet.image || PLACEHOLDER_IMAGE}
            alt={pet.name}
            onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
          />
        </div>

        <div className="detail-info">
          <div className="detail-title-row">
            <div>
              <span className="eyebrow">{pet.type}</span>
              <h1>{pet.name}</h1>
            </div>
            <span className={`badge badge-${pet.status}`}>{pet.status}</span>
          </div>

          <dl className="detail-facts">
            <div><dt>Breed</dt><dd>{pet.breed}</dd></div>
            <div><dt>Age</dt><dd>{pet.age} {pet.age === 1 ? 'year' : 'years'}</dd></div>
            <div><dt>Gender</dt><dd>{pet.gender}</dd></div>
            <div><dt>Status</dt><dd>{pet.status}</dd></div>
          </dl>

          <div className="detail-description">
            <h2>About {pet.name}</h2>
            <p>{pet.description}</p>
          </div>

          <div className="detail-actions">
            {isAdmin ? (
              <Link to="/admin/pets" className="btn btn-primary btn-lg">Manage pets</Link>
            ) : pet.status === 'available' ? (
              isAuthenticated ? (
                <Link to={`/apply/${pet.id}`} className="btn btn-primary btn-lg">Apply to adopt {pet.name}</Link>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg">Log in to apply</Link>
              )
            ) : (
              <div className="notice">This pet is no longer available for new applications.</div>
            )}
            <Link to="/pets" className="btn btn-outline btn-lg">Browse more pets</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
