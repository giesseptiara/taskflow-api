const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const taskRoutes = require('./routes/tasks');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'TaskFlow API is running'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      status: 'OK',
      database: 'connected',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: 'ERROR',
      database: 'disconnected'
    });
  }
});

module.exports = app;