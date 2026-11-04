const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../db');

// Verify the webhook HMAC-SHA256 signature
function verifySignature(req) {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  // Reject missing signatures, secrets, or raw request bodies
  if (
    typeof signature !== 'string' ||
    !secret ||
    !Buffer.isBuffer(req.rawBody)
  ) {
    return false;
  }

  // Calculate the expected signature
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('hex');

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  // Prevent timingSafeEqual from throwing on unequal lengths
  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  // Compare signatures securely
  return crypto.timingSafeEqual(
    receivedBuffer,
    expectedBuffer
  );
}

// POST /webhooks/alert
router.post('/alert', async (req, res) => {

  // Step 1: Authenticate the sender
  if (!verifySignature(req)) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  // Step 2: Extract alert information
  const { incident_id, source, payload } = req.body;

  // Step 3: Validate required fields
  if (
    typeof incident_id !== 'string' ||
    typeof source !== 'string' ||
    !incident_id.trim() ||
    !source.trim()
  ) {
    return res.status(400).json({
      error: 'Valid incident_id and source required'
    });
  }

// Validate incident_id UUID format before querying PostgreSQL
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

if (!uuidRegex.test(incident_id)) {
  return res.status(400).json({
    error: 'incident_id must be a valid UUID'
  });
}

  // Step 4: Store the alert in PostgreSQL
  try {
    const { rows } = await pool.query(
      `INSERT INTO alert_events
       (incident_id, source, payload)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [incident_id, source, payload || {}]
    );

    // Step 5: Return the stored alert
    return res.status(201).json(rows[0]);

  } catch (error) {
    console.error('Webhook database operation failed');

    return res.status(500).json({
      error: 'Unable to process alert'
    });
  }
});

module.exports = router;
