import { useEffect, useState } from 'react';
import './App.css';

import StatusBar from './components/StatusBar';
import IncidentTimeline from './components/IncidentTimeline';
import ResponderList from './components/ResponderList';
import RunbookViewer from './components/RunbookViewer';
import AlertFeed from './components/AlertFeed';
import SeverityChart from './components/SeverityChart';
import CloudOpsSidebar from './components/CloudOpsSidebar';

type Incident = {
  id: string;
  title: string;
  priority: string;
  status: string;
  declared_by: string;
  declared_at: string;
  escalation_sent_at: string | null;
};

type Page = 'Overview' | 'Incidents' | 'Alerts' | 'Runbooks';
type Theme = 'light' | 'dark';

const ESCALATION_MINUTES: Record<string, number> = {
  P0: 5,
  P1: 15,
  P2: 60,
};

function getEscalationStatus(incident: Incident, now: number) {
  const priority = incident.priority.toUpperCase();
  const threshold = ESCALATION_MINUTES[priority];

  if (incident.escalation_sent_at) {
    return {
      label: 'Escalation Recorded',
      detail: new Date(incident.escalation_sent_at).toLocaleString(),
      color: '#15803d',
    };
  }

  if (['resolved', 'closed'].includes(incident.status.toLowerCase())) {
    return {
      label: 'Incident Closed',
      detail: 'No escalation recorded',
      color: '#64748b',
    };
  }

  if (!threshold) {
    return {
      label: 'Not Applicable',
      detail: 'No automatic escalation configured',
      color: '#64748b',
    };
  }

  const declared = new Date(incident.declared_at).getTime();

  if (!Number.isFinite(declared)) {
    return {
      label: 'Unknown',
      detail: 'Invalid declaration timestamp',
      color: '#64748b',
    };
  }

  const remaining = declared + threshold * 60000 - now;

  if (remaining <= 0) {
    return {
      label: 'Escalation Overdue',
      detail: `${threshold}-minute threshold exceeded`,
      color: '#dc2626',
    };
  }

  return {
    label: 'Escalation Pending',
    detail: `${Math.ceil(remaining / 60000)} minute(s) remaining`,
    color: '#d97706',
  };
}

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<Page>('Overview');
  const [theme, setTheme] = useState<Theme>('light');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

 useEffect(() => {
  const timer = window.setInterval(() => {
    setNow(Date.now());
  }, 1000);

  return () => window.clearInterval(timer);
}, []);

  useEffect(() => {
  const controller = new AbortController();

  async function loadIncidents() {
    try {
      const response = await fetch('/api/incidents', {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
      }

      const data: Incident[] = await response.json();

      if (!controller.signal.aborted) {
        setIncidents(data);

        setSelectedId((previous) =>
          previous && data.some((incident) => incident.id === previous)
            ? previous
            : data[0]?.id ?? null
        );

        setError(null);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(
          err instanceof Error ? err.message : 'Failed to load incidents'
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  void loadIncidents();

  const interval = window.setInterval(() => {
    void loadIncidents();
  }, 15000);

  return () => {
    controller.abort();
    window.clearInterval(interval);
  };
}, []);


  const activeIncidents = incidents.filter(
    (incident) =>
      !['resolved', 'closed'].includes(incident.status.toLowerCase())
  );

  const criticalIncidents = incidents.filter(
  (incident) => ['P0', 'P1'].includes(incident.priority.toUpperCase())
);

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch = incident.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesPriority =
      priorityFilter === 'All' ||
      incident.priority.toUpperCase() === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const selectedIncident =
    incidents.find((incident) => incident.id === selectedId) ?? null;

  const metrics = [
    { label: 'Total Incidents', value: incidents.length, icon: '📋' },
    { label: 'Active Incidents', value: activeIncidents.length, icon: '⚡' },
    { label: 'High Severity / P0–P1', value: criticalIncidents.length, icon: '🚨' }
  ];

  return (
    <div className="cloudops-app" data-theme={theme}>
      <div className="cloudops-layout">
        <CloudOpsSidebar page={page} onNavigate={setPage} />

        <div className="cloudops-content">
      <header className="cloudops-card" style={{ borderRadius: 0 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h2 style={{ margin: 0 }}>☁️ CloudOps Control Tower</h2>
            <small style={{ color: 'var(--cloud-muted)' }}>
              Incident Command · DevSecOps Operations
            </small>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap'
          }}>
            <div role="status" style={{
              fontSize: 12,
              color: 'var(--cloud-muted)'
            }}>
              <span style={{
                color: error ? '#dc2626' : lastUpdated ? '#15803d' : '#64748b',
                fontWeight: 700
              }}>
                {error ? '● API Disconnected' : lastUpdated ? '● API Connected' : '● Connecting'}
              </span>
              {lastUpdated && (
                <span style={{ marginLeft: 10 }}>
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </div>
          <button
            className="cloudops-button"
            onClick={() =>
              setTheme(theme === 'light' ? 'dark' : 'light')
            }
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
          </div>
        </div>
      </header>

        <main className="cloudops-main">
        <h1 style={{ marginBottom: 6 }}>
          {page === 'Overview'
            ? 'Infrastructure Overview'
            : page === 'Incidents'
            ? 'Incident Management'
            : page === 'Alerts'
            ? 'Security Alerts'
            : 'Recovery Runbooks'}
        </h1>

        <p style={{ color: 'var(--cloud-muted)' }}>
          Centralized operational visibility and incident response
        </p>

        {loading && <p>Loading incidents...</p>}

        {error && <p role="alert">Error: {error}</p>}

        {!loading && !error && (
          <>
            {(page === 'Overview' || page === 'Incidents') && (
              <>
                <div className="cloudops-grid" style={{ margin: '24px 0' }}>
                  {metrics.map((metric) => (
                    <div className="cloudops-card" key={metric.label}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ color: 'var(--cloud-muted)' }}>
                          {metric.label}
                        </span>
                        <span aria-hidden="true">{metric.icon}</span>
                      </div>
                      <h2 style={{ fontSize: 32, marginBottom: 0 }}>
                        {metric.value}
                      </h2>
                    </div>
                  ))}
                </div>

                {page === "Overview" && (
                  <div style={{ marginBottom: 20 }}>
                    <SeverityChart incidents={incidents} />
                  </div>
                )}

                <section className="cloudops-card">
                  <h2>Incident Explorer</h2>

                  <div style={{
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 20
                  }}>
                    <input
                      className="cloudops-input"
                      style={{ flex: '1 1 220px' }}
                      placeholder="Search incidents..."
                      aria-label="Search incidents"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />

                    <select
                      className="cloudops-input"
                      style={{ flex: '0 1 140px' }}
                      aria-label="Filter by priority"
                      value={priorityFilter}
                      onChange={(event) =>
                        setPriorityFilter(event.target.value)
                      }
                    >
                      <option value="All">All priorities</option>
                      <option value="P1">P0</option>
                      <option value="P2">P1</option>
                      <option value="P3">P2</option>
                      <option value="P4">P3</option>
                    </select>
                  </div>

                  {filteredIncidents.length === 0 ? (
                    <p>No incidents match your search.</p>
                  ) : (
                    filteredIncidents.map((incident) => (
                      <button
                          type="button"
                          key={incident.id}
                          className={`cloudops-incident-card ${
                            selectedId === incident.id ? 'is-selected' : ''
                          }`}
                          data-priority={incident.priority.toUpperCase()}
                          aria-pressed={selectedId === incident.id}
                          onClick={() => setSelectedId(incident.id)}
                        >
                          <div className="cloudops-incident-card-top">
                            <span className="cloudops-incident-priority">
                              {incident.priority.toUpperCase()}
                            </span>
                            {selectedId === incident.id && (
                              <span className="cloudops-incident-selection">Selected</span>
                            )}
                          </div>
                          <strong className="cloudops-incident-title">{incident.title}</strong>
                          <div className="cloudops-incident-card-bottom">
                            <span>Declared by: {incident.declared_by}</span>
                            <span className="cloudops-incident-status">{incident.status}</span>
                          </div>
                      </button>
                    ))
                  )}
                </section>

                {selectedIncident && (
                  <section
                    className="cloudops-card"
                    style={{ marginTop: 20 }}
                  >
                    <h2>Incident Workspace</h2>
                    <h3>{selectedIncident.title}</h3>

                    <StatusBar
                      priority={selectedIncident.priority}
                      status={selectedIncident.status}
                    />

                    <div
  className="cloudops-card"
  style={{ marginTop: 20, marginBottom: 20 }}
>
  <h3>⏱ Escalation Monitoring</h3>

  {(() => {
    const escalation = getEscalationStatus(selectedIncident, now);

    return (
      <>
        <p>
          <strong>Priority:</strong> {selectedIncident.priority}
        </p>

        <p>
          <strong>Threshold:</strong>{' '}
          {ESCALATION_MINUTES[selectedIncident.priority.toUpperCase()]
            ? `${ESCALATION_MINUTES[
                selectedIncident.priority.toUpperCase()
              ]} minutes`
            : 'Not configured'}
        </p>

        <p>
          <strong>Status:</strong>{' '}
          <span style={{ color: escalation.color, fontWeight: 700 }}>
            {escalation.label}
          </span>
        </p>

        <p style={{ color: 'var(--cloud-muted)' }}>
          {escalation.detail}
        </p>
      </>
    );
  })()}

  <hr style={{ margin: '20px 0' }} />

  <h3>📄 Incident Post-Mortem</h3>

  <p style={{ color: 'var(--cloud-muted)' }}>
    Download the incident report with its details,
    alert events, and runbook activities.
  </p>

  <a
    className="cloudops-button"
    href={`/api/runbooks/incident/${selectedIncident.id}/postmortem`}
    download={`postmortem-${selectedIncident.id}.pdf`}
    style={{
      display: 'inline-block',
      textDecoration: 'none',
    }}
  >
    ⬇ Download Post-Mortem PDF
  </a>
</div>
                    <ResponderList incidentId={selectedIncident.id} />
                    <RunbookViewer incidentId={selectedIncident.id} />
                    <IncidentTimeline incidentId={selectedIncident.id} />
                  </section>
                )}
              </>
            )}

            {page === 'Alerts' && (
              <section className="cloudops-card">
                <AlertFeed />
              </section>
            )}

            {page === 'Runbooks' && (
              <section className="cloudops-card">
                <h2>Recovery Runbooks</h2>
                {incidents.map((incident) => (
                  <div key={incident.id} style={{ marginBottom: 24 }}>
                    <h3>{incident.title}</h3>
                    <RunbookViewer incidentId={incident.id} />
                  </div>
                ))}
              </section>
            )}
          </>
        )}
        </main>
        </div>
      </div>
    </div>
  );
}

export default App;
