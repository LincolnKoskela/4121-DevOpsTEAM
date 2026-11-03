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


// GET /incidents/:id/responders
router.get('/:id/responders', async (req, res) => {
  const { id } = req.params;

  // Validate incident UUID
  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!UUID_PATTERN.test(id)) {
    return res.status(400).json({
      error: 'Invalid incident UUID'
    });
  }

  try {
    const incident = await pool.query(
      'SELECT id FROM incidents WHERE id = $1',
      [id]
    );

    if (incident.rows.length === 0) {
      return res.status(404).json({
        error: 'Incident not found'
      });
    }

    const { rows } = await pool.query(
      `SELECT id, incident_id, user_name, role, assigned_at
       FROM responders
       WHERE incident_id = $1
       ORDER BY assigned_at ASC`,
      [id]
    );

    return res.json(rows);
  } catch (error) {
    console.error('Failed to retrieve responders:', error.message);

    return res.status(500).json({
      error: 'Unable to retrieve responders'
    });
  }
});


// GET /incidents/:id/events
router.get('/:id/events', async (req, res) => {
  const { id } = req.params;

  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!UUID_PATTERN.test(id)) {
    return res.status(400).json({
      error: 'Invalid incident UUID'
    });
  }

  try {
    const incident = await pool.query(
      'SELECT id FROM incidents WHERE id = $1',
      [id]
    );

    if (incident.rows.length === 0) {
      return res.status(404).json({
        error: 'Incident not found'
      });
    }

    const { rows } = await pool.query(
      `SELECT id, incident_id, source, payload, received_at
       FROM alert_events
       WHERE incident_id = $1
       ORDER BY received_at ASC, id ASC`,
      [id]
    );

    return res.json(rows);

  } catch (error) {
    console.error('Failed to retrieve alert events:', error.message);

    return res.status(500).json({
      error: 'Unable to retrieve alert events'
    });
  }
});

module.exports = router;
