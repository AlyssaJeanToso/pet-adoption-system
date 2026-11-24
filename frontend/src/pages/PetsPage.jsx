import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import PetCard from '../components/PetCard';
import { PET_TYPES } from '../constants';

export default function PetsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ status: 'available' });
    if (search.trim()) params.set('q', search.trim());
    if (type !== 'all') params.set('type', type);

    setLoading(true);
    setError('');
    api.get(`/pets?${params.toString()}`)
      .then((data) => { if (active) setPets(data.pets); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [search, type]);

  return (
    <section className="container section">
      <div className="page-heading">
        <span className="eyebrow">Adopt</span>
        <h1>Available pets</h1>
        <p>Search by name, breed or animal type. Every pet below is looking for a home.</p>
      </div>

      <form className="card search-bar" onSubmit={(event) => event.preventDefault()}>
        <label className="field">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try Buddy, Cat or Tabby..."
            aria-label="Search pets by name or type"
          />
        </label>
        <label className="field">
          <span>Type</span>
          <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter by type">
            <option value="all">All types</option>
            {PET_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => { setSearch(''); setType('all'); }}
        >
          Clear
        </button>
      </form>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {loading ? (
        <Loading label="Searching pets..." />
      ) : pets.length ? (
        <>
          <p className="result-count">{pets.length} {pets.length === 1 ? 'pet' : 'pets'} found</p>
          <div className="pet-grid">
            {pets.map((pet) => <PetCard key={pet.id} pet={pet} />)}
          </div>
        </>
      ) : (
        <div className="empty-state card">
          <span className="empty-icon" aria-hidden="true">🔎</span>
          <h3>No pets matched your search</h3>
          <p>Try another name or clear the filters.</p>
          <button type="button" className="btn btn-primary" onClick={() => { setSearch(''); setType('all'); }}>
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
