import { useEffect, useState } from 'react';

type AlertEvent = {
  id: string;
  incident_id: string;
  source: string;
  payload: {
    event?: string;
    message?: string;
    severity?: string;
  };
  received_at: string;
};

type IncidentTimelineProps = {
  incidentId: string;
};

function IncidentTimeline({ incidentId }: IncidentTimelineProps) {
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setEvents([]);

    async function loadEvents() {
      try {
        const response = await fetch(
          `/api/incidents/${encodeURIComponent(incidentId)}/events`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: AlertEvent[] = await response.json();

        if (!controller.signal.aborted) {
          setEvents(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load events'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => controller.abort();
  }, [incidentId]);

  if (loading) {
    return <p>Loading incident events...</p>;
  }

  if (error) {
    return <p role="alert">Timeline error: {error}</p>;
  }

  return (
    <section className="cloudops-incident-timeline">
      <h4>Incident Timeline</h4>

      {events.length === 0 ? (
        <p>No alert events recorded for this incident.</p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event.id}>
              <strong>
                {event.payload?.event || 'Alert received'}
              </strong>

              <p>
                {event.payload?.message || 'No message provided'}
              </p>

              <p>Source: {event.source}</p>

              {event.payload?.severity && (
                <p>Severity: {event.payload.severity}</p>
              )}

              <small>
                Received: {new Date(
                  event.received_at
                ).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default IncidentTimeline;
