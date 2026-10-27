import { useEffect, useState } from 'react';

import StatusBar from './components/StatusBar';
import IncidentTimeline from './components/IncidentTimeline';
import ResponderList from './components/ResponderList';
import RunbookViewer from './components/RunbookViewer';
import AlertFeed from './components/AlertFeed';

type Incident = {
  id: string;
  title: string;
  priority: string;
  status: string;
  declared_by: string;
  declared_at: string;
};

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadIncidents() {
      try {
        const response = await fetch('/api/incidents', {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`API returned HTTP ${response.status}`);
        }

        const data: Incident[] = await response.json();
        setIncidents(data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error ? err.message : 'Failed to load incidents'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadIncidents();

    return () => controller.abort();
  }, []);

  if (loading) {
    return <p>Loading incidents...</p>;
  }

  if (error) {
    return <p role="alert">Error: {error}</p>;
  }

  return (
    <div style={{ padding: '30px' }}>
      <h1>Incident Command War Room</h1>

      <h2>Active Incidents</h2>

      {incidents.length === 0 ? (
        <p>No incidents found.</p>
      ) : (
        incidents.map((incident) => (
          <div key={incident.id}>
            <h3>{incident.title}</h3>
            <p>Declared by: {incident.declared_by}</p>

            <StatusBar
              priority={incident.priority}
              status={incident.status}
            />

            <ResponderList incidentId={incident.id} />
            <RunbookViewer incidentId={incident.id} />
            <IncidentTimeline incidentId={incident.id} />
            <hr />
          </div>
        ))
      )}

      <AlertFeed />
    </div>
  );
}

export default App;
