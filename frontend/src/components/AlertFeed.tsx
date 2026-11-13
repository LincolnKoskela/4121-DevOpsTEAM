import { useEffect, useState } from 'react';

type AlertEvent = {
  id: string;
  incident_id: string | null;
  incident_title: string | null;
  source: string;
  payload: {
    event?: string;
    message?: string;
    severity?: string;
  };
  received_at: string;
};

function AlertFeed() {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAlerts() {
      try {
        const response = await fetch('/api/alerts', {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: AlertEvent[] = await response.json();

        if (!controller.signal.aborted) {
          setAlerts(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load alerts'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAlerts();

    return () => controller.abort();
  }, []);

  return (
    <section className="cloudops-alert-feed">
      <h2>Alert Feed</h2>

      {loading ? (
        <p>Loading alerts...</p>
      ) : error ? (
        <p role="alert">Alert Feed error: {error}</p>
      ) : alerts.length === 0 ? (
        <p>No alerts recorded.</p>
      ) : (
        <ul>
          {alerts.map(alert => (
            <li key={alert.id}>
              <strong>
                {alert.payload?.event || 'Alert received'}
              </strong>

              <p>
                {alert.payload?.message || 'No message provided'}
              </p>

              <p>
                Incident: {alert.incident_title || 'Unassigned'}
              </p>

              <p>Source: {alert.source}</p>

              {alert.payload?.severity && (
                <p>Severity: {alert.payload.severity}</p>
              )}

              <small>
                Received: {new Date(
                  alert.received_at
                ).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AlertFeed;
