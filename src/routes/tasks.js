const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch tasks'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'TODO',
      priority = 'MEDIUM'
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: 'Title and description are required'
      });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks
      (title, description, status, priority)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [title, description, status, priority]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create task'
    });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [title, description, status, priority, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to update task'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to delete task'
    });
  }
});


module.exports = router;