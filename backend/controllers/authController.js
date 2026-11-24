const bcrypt = require('bcryptjs');
const { get, run } = require('../database/helpers');
const { signToken } = require('../middleware/auth');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body || {};
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (cleanName.length < 2 || cleanName.length > 60) {
      return res.status(400).json({ message: 'Name must be between 2 and 60 characters.' });
    }
    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    if (role && role !== 'user') {
      return res.status(400).json({ message: 'Registration can only create regular user accounts.' });
    }

    const existing = await get('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [cleanName, cleanEmail, hash, 'user']
    );
    const user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Account created successfully.',
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Could not register. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanEmail || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    return res.json({
      message: 'Login successful.',
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Could not log in. Please try again.' });
  }
}

async function me(req, res) {
  try {
    const user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(401).json({ message: 'Account not found.' });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ message: 'Could not load your account.' });
  }
}

module.exports = { register, login, me };
