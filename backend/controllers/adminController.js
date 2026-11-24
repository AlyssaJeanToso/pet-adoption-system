const { all, get } = require('../database/helpers');

async function dashboard(req, res) {
  try {
    const [
      totalPets,
      availablePets,
      adoptedPets,
      totalApplications,
      pending,
      approved,
      rejected,
      totalUsers,
    ] = await Promise.all([
      get('SELECT COUNT(*) AS count FROM pets'),
      get("SELECT COUNT(*) AS count FROM pets WHERE status = 'available'"),
      get("SELECT COUNT(*) AS count FROM pets WHERE status = 'adopted'"),
      get('SELECT COUNT(*) AS count FROM applications'),
      get("SELECT COUNT(*) AS count FROM applications WHERE status = 'pending'"),
      get("SELECT COUNT(*) AS count FROM applications WHERE status = 'approved'"),
      get("SELECT COUNT(*) AS count FROM applications WHERE status = 'rejected'"),
      get('SELECT COUNT(*) AS count FROM users'),
    ]);

    const recentApplications = await all(`
      SELECT a.id, a.status, a.created_at, u.name AS user_name, p.name AS pet_name
      FROM applications a
      JOIN users u ON u.id = a.user_id
      JOIN pets p ON p.id = a.pet_id
      ORDER BY a.id DESC
      LIMIT 5
    `);

    return res.json({
      stats: {
        totalPets: totalPets.count,
        availablePets: availablePets.count,
        adoptedPets: adoptedPets.count,
        totalApplications: totalApplications.count,
        pending: pending.count,
        approved: approved.count,
        rejected: rejected.count,
        totalUsers: totalUsers.count,
      },
      recentApplications,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ message: 'Could not load the dashboard.' });
  }
}

module.exports = { dashboard };
