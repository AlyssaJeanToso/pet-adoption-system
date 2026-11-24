import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import PetCard from '../components/PetCard';

export default function HomePage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/pets?status=available')
      .then((data) => { if (active) setPets(data.pets.slice(0, 3)); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="eyebrow">A forever home starts here</span>
            <h1>Give a pet a second chance.</h1>
            <p>
              Browse animals looking for loving families, learn their stories, and send an
              adoption application in just a few clicks.
            </p>
            <div className="hero-actions">
              <Link to="/pets" className="btn btn-primary btn-lg">Browse available pets</Link>
              <Link to="/register" className="btn btn-outline btn-lg">Create an account</Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <img src="/pet-placeholder.svg" alt="" />
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Meet them</span>
            <h2>Pets waiting for a family</h2>
          </div>
          <Link to="/pets" className="text-link">See all pets →</Link>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />
        {loading ? (
          <Loading label="Finding pets..." />
        ) : pets.length ? (
          <div className="pet-grid">
            {pets.map((pet) => <PetCard key={pet.id} pet={pet} />)}
          </div>
        ) : (
          <div className="empty-state card">
            <p>No pets are available right now. Please check back soon.</p>
          </div>
        )}
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">How it works</span>
            <h2>Three simple steps</h2>
          </div>
        </div>
        <div className="steps-grid">
          <div className="card step-card"><span className="step-number">1</span><h3>Create an account</h3><p>Register as a regular user to submit adoption applications.</p></div>
          <div className="card step-card"><span className="step-number">2</span><h3>Find your match</h3><p>Search pets by name or type and open a profile to learn more.</p></div>
          <div className="card step-card"><span className="step-number">3</span><h3>Apply and track</h3><p>Explain why you are a good match and follow your application status.</p></div>
        </div>
      </section>
    </>
  );
}
