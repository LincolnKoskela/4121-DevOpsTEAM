const pool = require('./db')

const ESCALATION_THRESHOLDS = {
  P0: 5 * 60 * 1000, // 5 minutes
  P1: 15 * 60 * 1000, // 15 minutes
  P2: 60 * 60 * 1000, // 60 minutes
};

async function checkEscalations() {
  const { rows } = await pool.query(`
    SELECT i.*, array_agg(r.user_name) AS responders
    FROM incidents i
    LEFT JOIN responders r ON r.incident_id = i.id
    WHERE i.status = 'open'
    AND i.priority IN ('P0', 'P1', 'P2')
    AND i.escalation_sent_at IS NULL
    GROUP BY i.id
  `);

  for (const incident of rows) {
    const threshold = ESCALATION_THRESHOLDS[incident.priority];
    const age = Date.now() - new Date(incident.declared_at).getTime();

    if (age > threshold) {
      console.log(
        `ESCALATE: ${incident.id} (${incident.priority}) — ${Math.round(age / 60000)}m old`
      );

      // In production: call PagerDuty, Slack, or email API
      await pool.query(
        'UPDATE incidents SET escalation_sent_at=NOW() WHERE id=$1',
        [incident.id]
      );
    }
  }
}

// Run every 60 seconds
setInterval(checkEscalations, 60 * 1000);

module.exports = { checkEscalations };
