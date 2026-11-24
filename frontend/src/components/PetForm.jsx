import React, { useEffect, useState } from 'react';
import Alert from './Alert';
import { PET_GENDERS, PET_STATUSES, PET_TYPES } from '../constants';

const EMPTY = {
  name: '',
  type: 'Dog',
  breed: '',
  age: '',
  gender: 'Other',
  description: '',
  image: '',
  status: 'available',
};

export default function PetForm({ initialPet, onSubmit, onCancel, saving = false }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(
      initialPet
        ? { ...EMPTY, ...initialPet, age: String(initialPet.age ?? '') }
        : EMPTY
    );
    setError('');
  }, [initialPet]);

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Pet name is required.';
    if (!form.breed.trim()) return 'Breed is required.';
    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 0 || age > 40) return 'Age must be a number from 0 to 40.';
    if (form.description.trim().length < 10) return 'Description must be at least 10 characters.';
    if (form.image.trim() && !/^(https?:\/\/|\/)/i.test(form.image.trim())) {
      return 'Image must start with http://, https:// or /.';
    }
    return '';
  };

  const submit = (event) => {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    onSubmit({ ...form, age: Number(form.age) });
  };

  return (
    <form className="card form-card pet-form" onSubmit={submit} noValidate>
      <div className="form-card-header">
        <h2>{initialPet ? `Edit ${initialPet.name}` : 'Add a new pet'}</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>

      <Alert type="error" message={error} />

      <div className="form-grid">
        <label className="field">
          <span>Name *</span>
          <input name="name" value={form.name} onChange={change} placeholder="e.g. Buddy" maxLength={80} />
        </label>
        <label className="field">
          <span>Type *</span>
          <select name="type" value={form.type} onChange={change}>
            {PET_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Breed *</span>
          <input name="breed" value={form.breed} onChange={change} placeholder="e.g. Labrador Mix" maxLength={80} />
        </label>
        <label className="field">
          <span>Age *</span>
          <input name="age" type="number" min="0" max="40" value={form.age} onChange={change} placeholder="0" />
        </label>
        <label className="field">
          <span>Gender *</span>
          <select name="gender" value={form.gender} onChange={change}>
            {PET_GENDERS.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Status *</span>
          <select name="status" value={form.status} onChange={change}>
            {PET_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label className="field field-full">
          <span>Description *</span>
          <textarea
            name="description"
            rows="3"
            value={form.description}
            onChange={change}
            placeholder="Tell students about this pet's personality..."
            maxLength={1000}
          />
        </label>
        <label className="field field-full">
          <span>Image URL (optional)</span>
          <input
            name="image"
            value={form.image}
            onChange={change}
            placeholder="https://example.com/pet.jpg"
          />
          <small>Leave empty to show the default paw image.</small>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : initialPet ? 'Save changes' : 'Add pet'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}
