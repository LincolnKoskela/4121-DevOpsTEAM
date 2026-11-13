import { useEffect, useState } from 'react';

type Responder = {
  id: string;
  incident_id: string;
  user_name: string;
  role: string;
  assigned_at: string;
};

type Props = {
  incidentId: string;
};

function ResponderList({ incidentId }: Props) {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setResponders([]);

    async function loadResponders() {
      try {
        const response = await fetch(
          `/api/incidents/${encodeURIComponent(incidentId)}/responders`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: Responder[] = await response.json();
        setResponders(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('Unable to load responders');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadResponders();

    return () => controller.abort();
  }, [incidentId]);

  return (
    <section className="cloudops-responder-list">
      <h2>Responders</h2>

      {loading && <p>Loading responders...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && responders.length === 0 && (
        <p>No responders assigned.</p>
      )}

      {!loading && !error && responders.length > 0 && (
        <ul>
          {responders.map((responder) => (
            <li key={responder.id}>
              <strong>{responder.user_name}</strong>
              {' — '}
              {responder.role}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ResponderList;
