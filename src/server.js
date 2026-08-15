const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');

const app = express();

const PORT = process.env.PORT || 3000;

const taskRoutes = require('./routes/tasks');

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

app.listen(PORT, () => {
  console.log(`TaskFlow API running on http://localhost:${PORT}`);
});