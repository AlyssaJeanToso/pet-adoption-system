import React from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_IMAGE } from '../constants';

export default function PetCard({ pet, showActions = true }) {
  const status = pet.status || 'available';

  return (
    <article className="card pet-card">
      <div className="pet-image-wrap">
        <img
          src={pet.image || PLACEHOLDER_IMAGE}
          alt={pet.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
        <span className={`badge badge-${status}`}>{status}</span>
      </div>

      <div className="pet-card-body">
        <h3>{pet.name}</h3>
        <p className="pet-meta">{pet.type} · {pet.breed}</p>
        <p className="pet-subtle">
          {pet.age} {pet.age === 1 ? 'year' : 'years'} old · {pet.gender}
        </p>
        <p className="pet-description">
          {pet.description?.length > 95 ? `${pet.description.slice(0, 95)}…` : pet.description}
        </p>
        <div className="card-actions">
          <Link to={`/pets/${pet.id}`} className="btn btn-outline btn-sm">View details</Link>
          {showActions && status === 'available' && (
            <Link to={`/apply/${pet.id}`} className="btn btn-primary btn-sm">Apply now</Link>
          )}
        </div>
      </div>
    </article>
  );
}
