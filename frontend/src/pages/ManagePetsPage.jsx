import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import PetForm from '../components/PetForm';
import { PLACEHOLDER_IMAGE } from '../constants';

export default function ManagePetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get('/pets?status=all');
      setPets(data.pets);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
    setFeedback({ type: '', message: '' });
  };

  const openEdit = (pet) => {
    setEditing(pet);
    setShowForm(true);
    setFeedback({ type: '', message: '' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const savePet = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/pets/${editing.id}`, payload);
        setFeedback({ type: 'success', message: `${payload.name} was updated.` });
      } else {
        await api.post('/pets', payload);
        setFeedback({ type: 'success', message: `${payload.name} was added.` });
      }
      closeForm();
      await load();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const deletePet = async (pet) => {
    if (!window.confirm(`Delete ${pet.name}? Related applications will also be removed.`)) return;
    try {
      const data = await api.del(`/pets/${pet.id}`);
      setFeedback({ type: 'success', message: data.message });
      await load();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <section className="container section">
      <div className="page-heading admin-heading">
        <div>
          <span className="eyebrow">Admin area</span>
          <h1>Manage pets</h1>
          <p>Add, edit, delete pets and change their availability.</p>
        </div>
        <div className="quick-actions">
          {!showForm && <button type="button" className="btn btn-primary" onClick={openAdd}>+ Add pet</button>}
          <Link to="/admin" className="btn btn-outline">Back to dashboard</Link>
        </div>
      </div>

      <Alert
        type={feedback.type || 'info'}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      {showForm && (
        <PetForm initialPet={editing} onSubmit={savePet} onCancel={closeForm} saving={saving} />
      )}

      {loading ? (
        <Loading label="Loading pets..." />
      ) : pets.length ? (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Pet</th><th>Type</th><th>Age</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id}>
                  <td>
                    <div className="table-pet">
                      <img
                        src={pet.image || PLACEHOLDER_IMAGE}
                        alt=""
                        onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div><strong>{pet.name}</strong><small>{pet.breed}</small></div>
                    </div>
                  </td>
                  <td>{pet.type}</td>
                  <td>{pet.age}</td>
                  <td><span className={`badge badge-${pet.status}`}>{pet.status}</span></td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(pet)}>Edit</button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => deletePet(pet)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state card">
          <h3>No pets in the database</h3>
          <p>Use the Add pet button to create the first record.</p>
        </div>
      )}
    </section>
  );
}
