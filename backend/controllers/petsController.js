const { all, get, run } = require('../database/helpers');

const TYPES = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'];
const GENDERS = ['Male', 'Female', 'Other'];
const STATUSES = ['available', 'pending', 'adopted'];

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Returns either { error } or { pet } with cleaned values.
function buildPetData(body = {}, existing = {}) {
  const pick = (key, fallback) => (body[key] === undefined ? fallback : body[key]);

  const name = String(pick('name', existing.name || '')).trim();
  const type = String(pick('type', existing.type || '')).trim();
  const breed = String(pick('breed', existing.breed || '')).trim();
  const rawAge = pick('age', existing.age ?? 0);
  const age = Number(rawAge);
  const gender = String(pick('gender', existing.gender || '')).trim();
  const description = String(pick('description', existing.description || '')).trim();
  const image = String(pick('image', existing.image || '')).trim();
  const status = String(pick('status', existing.status || 'available')).trim();

  if (!name || name.length > 80) return { error: 'Pet name is required (max 80 characters).' };
  if (!TYPES.includes(type)) return { error: `Type must be one of: ${TYPES.join(', ')}.` };
  if (!breed || breed.length > 80) return { error: 'Breed is required (max 80 characters).' };
  if (!Number.isInteger(age) || age < 0 || age > 40) return { error: 'Age must be a whole number from 0 to 40.' };
  if (!GENDERS.includes(gender)) return { error: 'Gender must be Male, Female or Other.' };
  if (description.length < 10 || description.length > 1000) {
    return { error: 'Description must be between 10 and 1000 characters.' };
  }
  if (image && !/^(https?:\/\/|\/)/i.test(image)) {
    return { error: 'Image must be a URL starting with http://, https:// or /.' };
  }
  if (!STATUSES.includes(status)) return { error: 'Invalid pet status.' };

  return { pet: { name, type, breed, age, gender, description, image, status } };
}

async function listPets(req, res) {
  try {
    const { q = '', type = '', status = '' } = req.query;
    let sql = 'SELECT * FROM pets WHERE 1 = 1';
    const params = [];

    if (q) {
      sql += ' AND (name LIKE ? OR type LIKE ? OR breed LIKE ?)';
      const term = `%${q}%`;
      params.push(term, term, term);
    }
    if (type && type !== 'all') {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    } else if (!status) {
      // Public browsing shows available pets by default.
      sql += " AND status = 'available'";
    }

    sql += " ORDER BY CASE status WHEN 'available' THEN 0 ELSE 1 END, id DESC";
    const pets = await all(sql, params);
    return res.json({ pets });
  } catch (err) {
    console.error('List pets error:', err);
    return res.status(500).json({ message: 'Could not load pets.' });
  }
}

async function getPet(req, res) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid pet id.' });

    const pet = await get('SELECT * FROM pets WHERE id = ?', [id]);
    if (!pet) return res.status(404).json({ message: 'Pet not found.' });
    return res.json({ pet });
  } catch (err) {
    console.error('Get pet error:', err);
    return res.status(500).json({ message: 'Could not load this pet.' });
  }
}

async function createPet(req, res) {
  try {
    const result = buildPetData(req.body || {});
    if (result.error) return res.status(400).json({ message: result.error });

    const p = result.pet;
    const inserted = await run(
      `INSERT INTO pets (name, type, breed, age, gender, description, image, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.type, p.breed, p.age, p.gender, p.description, p.image, p.status]
    );
    const pet = await get('SELECT * FROM pets WHERE id = ?', [inserted.lastID]);
    return res.status(201).json({ message: 'Pet added successfully.', pet });
  } catch (err) {
    console.error('Create pet error:', err);
    return res.status(500).json({ message: 'Could not add this pet.' });
  }
}

async function updatePet(req, res) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid pet id.' });

    const existing = await get('SELECT * FROM pets WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ message: 'Pet not found.' });

    const result = buildPetData(req.body || {}, existing);
    if (result.error) return res.status(400).json({ message: result.error });

    const p = result.pet;
    await run(
      `UPDATE pets
       SET name = ?, type = ?, breed = ?, age = ?, gender = ?, description = ?, image = ?, status = ?
       WHERE id = ?`,
      [p.name, p.type, p.breed, p.age, p.gender, p.description, p.image, p.status, id]
    );
    const pet = await get('SELECT * FROM pets WHERE id = ?', [id]);
    return res.json({ message: 'Pet updated successfully.', pet });
  } catch (err) {
    console.error('Update pet error:', err);
    return res.status(500).json({ message: 'Could not update this pet.' });
  }
}

async function deletePet(req, res) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid pet id.' });

    const pet = await get('SELECT id FROM pets WHERE id = ?', [id]);
    if (!pet) return res.status(404).json({ message: 'Pet not found.' });

    // Related applications are removed by the ON DELETE CASCADE foreign key.
    await run('DELETE FROM pets WHERE id = ?', [id]);
    return res.json({ message: 'Pet deleted successfully.' });
  } catch (err) {
    console.error('Delete pet error:', err);
    return res.status(500).json({ message: 'Could not delete this pet.' });
  }
}

module.exports = { listPets, getPet, createPet, updatePet, deletePet };
