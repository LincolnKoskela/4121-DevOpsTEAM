const pool = require('./db');

const THRESHOLDS = {
  P0: '5 minutes',
  P1: '15 minutes',
  P2: '60 minutes',
};

const TEST_INCIDENT_ID = process.env.ESCALATION_TEST_INCIDENT_ID || null;

let running = false;

async function checkEscalations() {
  if (running) return [];

  running = true;

  try {
    const { rows } = await pool.query(
      `
      UPDATE incidents
      SET escalation_sent_at = NOW()
      WHERE status = 'open'
        AND priority IN ('P0', 'P1', 'P2')
        AND escalation_sent_at IS NULL
        AND (
          (priority = 'P0' AND declared_at <= NOW() - INTERVAL '5 minutes')
          OR
          (priority = 'P1' AND declared_at <= NOW() - INTERVAL '15 minutes')
          OR
          (priority = 'P2' AND declared_at <= NOW() - INTERVAL '60 minutes')
        )
        AND ($1::uuid IS NULL OR id = $1::uuid)
      RETURNING id, title, priority, escalation_sent_at
      `,
      [TEST_INCIDENT_ID]
    );

    for (const incident of rows) {
      console.warn(
        `ESCALATION RECORDED: ${incident.id} (${incident.priority})`
      );
    }

    return rows;
  } catch (error) {
    console.error('Escalation check failed:', error.message);
    return [];
  } finally {
    running = false;
  }
}

function startEscalationTimer() {
  console.log('Escalation timer started');

  if (TEST_INCIDENT_ID) {
    console.log(`Escalation test mode: ${TEST_INCIDENT_ID}`);
  }

  void checkEscalations();

  const timer = setInterval(() => {
    void checkEscalations();
  }, 15000);

  timer.unref();

  return timer;
}

module.exports = {
  THRESHOLDS,
  checkEscalations,
  startEscalationTimer,
};
