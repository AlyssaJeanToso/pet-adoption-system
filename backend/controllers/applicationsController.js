const { all, get, run } = require('../database/helpers');

const VALID_STATUSES = ['pending', 'approved', 'rejected'];

const applicationSelect = `
  SELECT a.id, a.user_id, a.pet_id, a.reason, a.status, a.created_at,
         u.name AS user_name, u.email AS user_email,
         p.name AS pet_name, p.type AS pet_type, p.image AS pet_image, p.status AS pet_status
  FROM applications a
  JOIN users u ON u.id = a.user_id
  JOIN pets  p ON p.id = a.pet_id
`;

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function applyForPet(req, res) {
  try {
    const petId = parseId(req.body?.pet_id);
    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';

    if (!petId) return res.status(400).json({ message: 'Please choose a valid pet.' });
    if (reason.length < 10 || reason.length > 1000) {
      return res.status(400).json({ message: 'Please write a reason between 10 and 1000 characters.' });
    }

    const pet = await get('SELECT id, name, status FROM pets WHERE id = ?', [petId]);
    if (!pet) return res.status(404).json({ message: 'That pet no longer exists.' });
    if (pet.status !== 'available') {
      return res.status(409).json({ message: 'Sorry, this pet is not available for adoption.' });
    }

    const duplicate = await get(
      `SELECT id FROM applications
       WHERE user_id = ? AND pet_id = ? AND status IN ('pending', 'approved')`,
      [req.user.id, petId]
    );
    if (duplicate) {
      return res.status(409).json({ message: 'You already have an active application for this pet.' });
    }

    const inserted = await run(
      'INSERT INTO applications (user_id, pet_id, reason, status) VALUES (?, ?, ?, ?)',
      [req.user.id, petId, reason, 'pending']
    );
    const application = await get(`${applicationSelect} WHERE a.id = ?`, [inserted.lastID]);

    return res.status(201).json({
      message: `Your application for ${pet.name} was submitted.`,
      application,
    });
  } catch (err) {
    console.error('Apply error:', err);
    return res.status(500).json({ message: 'Could not submit your application.' });
  }
}

async function myApplications(req, res) {
  try {
    const applications = await all(
      `${applicationSelect} WHERE a.user_id = ? ORDER BY a.id DESC`,
      [req.user.id]
    );
    return res.json({ applications });
  } catch (err) {
    console.error('My applications error:', err);
    return res.status(500).json({ message: 'Could not load your applications.' });
  }
}

async function allApplications(req, res) {
  try {
    const { status = 'all' } = req.query;
    let sql = applicationSelect;
    const params = [];

    if (status !== 'all') {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter.' });
      }
      sql += ' WHERE a.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY a.id DESC';

    const applications = await all(sql, params);
    return res.json({ applications });
  } catch (err) {
    console.error('All applications error:', err);
    return res.status(500).json({ message: 'Could not load applications.' });
  }
}

async function oneApplication(req, res) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid application id.' });

    const application = await get(`${applicationSelect} WHERE a.id = ?`, [id]);
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    if (req.user.role !== 'admin' && application.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only view your own applications.' });
    }
    return res.json({ application });
  } catch (err) {
    console.error('One application error:', err);
    return res.status(500).json({ message: 'Could not load that application.' });
  }
}

async function updateStatus(req, res) {
  try {
    const id = parseId(req.params.id);
    const status = String(req.body?.status || '').trim();

    if (!id) return res.status(400).json({ message: 'Invalid application id.' });
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    const application = await get('SELECT * FROM applications WHERE id = ?', [id]);
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    const pet = await get('SELECT id, name, status FROM pets WHERE id = ?', [application.pet_id]);
    if (!pet) return res.status(404).json({ message: 'The pet for this application no longer exists.' });
    if (status === 'approved' && pet.status === 'adopted') {
      return res.status(409).json({ message: 'This pet has already been adopted.' });
    }

    await run('BEGIN TRANSACTION');
    try {
      await run('UPDATE applications SET status = ? WHERE id = ?', [status, id]);

      if (status === 'approved') {
        await run("UPDATE pets SET status = 'adopted' WHERE id = ?", [pet.id]);
        await run(
          "UPDATE applications SET status = 'rejected' WHERE pet_id = ? AND id <> ? AND status = 'pending'",
          [pet.id, id]
        );
      } else {
        const otherApproved = await get(
          "SELECT id FROM applications WHERE pet_id = ? AND status = 'approved' AND id <> ?",
          [pet.id, id]
        );
        if (!otherApproved) {
          await run("UPDATE pets SET status = 'available' WHERE id = ?", [pet.id]);
        }
      }

      await run('COMMIT');
    } catch (txErr) {
      await run('ROLLBACK');
      throw txErr;
    }

    const updated = await get(`${applicationSelect} WHERE a.id = ?`, [id]);
    return res.json({
      message: `Application ${status} successfully.`,
      application: updated,
    });
  } catch (err) {
    console.error('Update application status error:', err);
    return res.status(500).json({ message: 'Could not update this application.' });
  }
}

module.exports = {
  applyForPet,
  myApplications,
  allApplications,
  oneApplication,
  updateStatus,
};
