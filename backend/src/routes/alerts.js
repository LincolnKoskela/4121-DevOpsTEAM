const router = require('express').Router();
const pool = require('../db');

// GET /alerts
// Return the 50 most recent alert events across incidents.
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        ae.id,
        ae.incident_id,
        ae.source,
        ae.payload,
        ae.received_at,
        i.title AS incident_title
      FROM alert_events AS ae
      LEFT JOIN incidents AS i
        ON ae.incident_id = i.id
      ORDER BY ae.received_at DESC, ae.id DESC
      LIMIT 50
    `);

    return res.json(rows);
  } catch (error) {
    console.error('Failed to retrieve alerts:', error.message);

    return res.status(500).json({
      error: 'Unable to retrieve alerts'
    });
  }
});

module.exports = router;
