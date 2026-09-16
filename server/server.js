require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const pool = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const habitRoutes = require('./src/routes/habitRoutes');
const { errorHandler } = require('./src/middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

const initializeDatabase = async () => {
  const schemaPath = path.join(__dirname, 'src', 'sql', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schemaSql);
};

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'Habit Tracker API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

(async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Habit Tracker API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
})();
