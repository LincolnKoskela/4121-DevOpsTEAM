const router = require('express').Router();
const pool = require('../db');

// POST /incidents
router.post('/', async (req, res) => {
  const { title, priority, declared_by } = req.body;

  if (!title || !priority || !declared_by) {
    return res.status(400).json({
      error: 'title, priority, declared_by required'
    });
  }

  const VALID_PRIORITIES = ['P0', 'P1', 'P2', 'P3'];

  if (!VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({
      error: 'Invalid priority'
    });
  }

  const { rows } = await pool.query(
    'INSERT INTO incidents(title,priority,declared_by) VALUES($1,$2,$3) RETURNING *',
    [title, priority, declared_by]
  );

  res.status(201).json(rows[0]);
});

// GET /incidents
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM incidents ORDER BY declared_at DESC'
  );

  res.json(rows);
});

// PATCH /incidents/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;

  const VALID_STATUS = ['open', 'investigating', 'resolved', 'closed'];

  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({
      error: 'Invalid status'
    });
  }

  const { rows } = await pool.query(
    'UPDATE incidents SET status=$1 WHERE id=$2 RETURNING *',
    [status, req.params.id]
  );

  if (!rows.length) {
    return res.status(404).json({
      error: 'Not found'
    });
  }

  res.json(rows[0]);
});

// POST /incidents/:id/responders
router.post('/:id/responders', async (req, res) => {
  const { user_name, role } = req.body;

  const VALID_ROLES = [
    'incident-commander',
    'responder',
    'observer'
  ];

  if (!user_name || !VALID_ROLES.includes(role)) {
    return res.status(400).json({
      error: 'Valid user_name and role required'
    });
  }

  const { rows } = await pool.query(
    'INSERT INTO responders(incident_id,user_name,role) VALUES($1,$2,$3) RETURNING *',
    [req.params.id, user_name, role]
  );

  res.status(201).json(rows[0]);
});

module.exports = router;
