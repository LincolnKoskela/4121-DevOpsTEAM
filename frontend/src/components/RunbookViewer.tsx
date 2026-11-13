import { useEffect, useState } from 'react';

type RunbookStep = {
  order: number;
  title: string;
  instructions: string;
  completed: boolean;
};

type Runbook = {
  id: string;
  incident_id: string;
  name: string;
  steps: RunbookStep[];
  created_at: string;
};

type RunbookViewerProps = {
  incidentId: string;
};

function RunbookViewer({ incidentId }: RunbookViewerProps) {
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setRunbooks([]);

    async function loadRunbooks() {
      try {
        const response = await fetch(
          `/api/runbooks/incident/${encodeURIComponent(incidentId)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: Runbook[] = await response.json();

        if (!controller.signal.aborted) {
          setRunbooks(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load runbooks'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRunbooks();
    return () => controller.abort();
  }, [incidentId]);

  async function updateStep(
    runbookId: string,
    stepOrder: number,
    completed: boolean
  ) {
    const key = `${runbookId}-${stepOrder}`;
    setSaving(key);
    setError(null);

    try {
      const response = await fetch(
        `/api/runbooks/${encodeURIComponent(runbookId)}/steps/${stepOrder}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed })
        }
      );

      if (!response.ok) {
        throw new Error(`Update failed: HTTP ${response.status}`);
      }

      const result: {
        runbook_id: string;
        step: RunbookStep;
      } = await response.json();

      setRunbooks(previous =>
        previous.map(runbook =>
          runbook.id === result.runbook_id
            ? {
                ...runbook,
                steps: runbook.steps.map(step =>
                  step.order === result.step.order
                    ? { ...step, completed: result.step.completed }
                    : step
                )
              }
            : runbook
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update step'
      );
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <p>Loading runbooks...</p>;

  return (
    <section className="cloudops-runbook-viewer">
      <h4>Incident Runbooks</h4>

      {error && <p role="alert">Runbook error: {error}</p>}

      {runbooks.length === 0 && !error && (
        <p>No runbooks assigned to this incident.</p>
      )}

      {runbooks.map(runbook => (
        <div key={runbook.id}>
          <h4>{runbook.name}</h4>

          <p>
            Completed: {runbook.steps.filter(s => s.completed).length}
            {' / '}
            {runbook.steps.length}
          </p>

          <ol>
            {[...runbook.steps]
              .sort((a, b) => a.order - b.order)
              .map(step => {
                const key = `${runbook.id}-${step.order}`;

                return (
                  <li key={step.order}>
                    <label>
                      <input
                        type="checkbox"
                        checked={step.completed}
                        disabled={saving !== null}
                        onChange={event =>
                          updateStep(
                            runbook.id,
                            step.order,
                            event.target.checked
                          )
                        }
                      />
                      <strong>{step.title}</strong>
                    </label>

                    <p>{step.instructions}</p>

                    {saving === key && <p>Saving...</p>}
                  </li>
                );
              })}
          </ol>
        </div>
      ))}
    </section>
  );
}

export default RunbookViewer;
