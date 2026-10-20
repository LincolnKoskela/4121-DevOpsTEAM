function RunbookViewer() {
  return (
    <div>
      <h2>Runbook</h2>

      <label>
        <input type="checkbox" />
        Check application health
      </label>

      <br />

      <label>
        <input type="checkbox" />
        Check database connection
      </label>

      <br />

      <label>
        <input type="checkbox" />
        Escalate if unresolved
      </label>
    </div>
  );
}

export default RunbookViewer;
