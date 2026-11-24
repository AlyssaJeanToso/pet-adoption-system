const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Creates tables and seeds a fresh database on first run.
require('./database/database');

const { port } = require('./config/config');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Pet adoption API is running.' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Any unknown API path returns JSON, never the frontend HTML.
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

// Optional: serve the built frontend so `npm run build` + `npm start` works from one port.
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/.*/, (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in the request body.' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ message: 'Something went wrong on the server.' });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
