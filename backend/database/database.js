const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const { dbPath } = require('../config/config');

const file = dbPath || path.join(__dirname, 'petadoption.db');

const db = new sqlite3.Database(file, (err) => {
  if (err) {
    console.error('Could not open SQLite database:', err.message);
    process.exit(1);
  }
  console.log(`SQLite database ready: ${file}`);
});

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  // Only three main tables: users, pets and applications.
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name     TEXT NOT NULL,
      email    TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password TEXT NOT NULL,
      role     TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      type        TEXT NOT NULL,
      breed       TEXT NOT NULL,
      age         INTEGER NOT NULL DEFAULT 0,
      gender      TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
      description TEXT NOT NULL,
      image       TEXT NOT NULL DEFAULT '',
      status      TEXT NOT NULL DEFAULT 'available'
                  CHECK (status IN ('available', 'pending', 'adopted'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      pet_id     INTEGER NOT NULL,
      reason     TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (pet_id)  REFERENCES pets(id)  ON DELETE CASCADE
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_applications_pet ON applications(pet_id)');
});

// Seed a fresh database so the project is usable immediately.
// These are real database rows, not hardcoded frontend data.
function seedIfEmpty() {
  db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
    if (err) {
      console.error('Could not check seed data:', err.message);
      return;
    }
    if (row.count > 0) return; // Database is already in use.

    const adminHash = bcrypt.hashSync('admin123', 10);
    const userHash = bcrypt.hashSync('user123', 10);

    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@pets.com', adminHash, 'admin'],
      function (insertErr) {
        if (insertErr) return console.error('Admin seed failed:', insertErr.message);

        db.run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          ['Demo User', 'user@pets.com', userHash, 'user'],
          (userErr) => {
            if (userErr) console.error('User seed failed:', userErr.message);
          }
        );

        const pets = [
          ['Buddy', 'Dog', 'Golden Retriever', 3, 'Male', 'Friendly, energetic and great with children. Buddy loves long walks and fetch.', 'https://images.unsplash.com/photo-1552053831-71594a27632?auto=format&fit=crop&w=800&q=80', 'available'],
          ['Luna', 'Cat', 'Domestic Shorthair', 2, 'Female', 'Calm and affectionate. Luna enjoys sunny windows and gentle company.', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', 'available'],
          ['Clover', 'Rabbit', 'Holland Lop', 1, 'Female', 'Gentle little rabbit who loves leafy greens and a quiet home.', 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80', 'available'],
          ['Max', 'Dog', 'Labrador Mix', 4, 'Male', 'Loyal and well-trained. Max would make a wonderful family companion.', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80', 'available'],
          ['Milo', 'Cat', 'Tabby', 1, 'Male', 'Playful and curious. Milo is always first to greet visitors.', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80', 'available'],
          ['Sunny', 'Bird', 'Budgie', 2, 'Other', 'A cheerful budgie with a big personality and a love for singing.', 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80', 'available'],
        ];

        const stmt = db.prepare(`
          INSERT INTO pets (name, type, breed, age, gender, description, image, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        pets.forEach((pet) => stmt.run(pet));
        stmt.finalize(() => console.log('Seeded demo users and pets.'));
      }
    );
  });
}

db.serialize(seedIfEmpty);

module.exports = db;
