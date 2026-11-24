require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  dbPath: process.env.DB_PATH || null,
};
