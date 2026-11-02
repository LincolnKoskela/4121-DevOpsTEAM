type IncidentPriority = {
  priority: string;
};

type Props = {
  incidents: IncidentPriority[];
};

const priorities = [
  { name: 'P1', label: 'Critical', color: '#e11d48' },
  { name: 'P2', label: 'High', color: '#f59e0b' },
  { name: 'P3', label: 'Medium', color: '#3b82f6' },
  { name: 'P4', label: 'Low', color: '#0d9488' }
];

function SeverityChart({ incidents }: Props) {
  const total = incidents.length;

  const counts = priorities.map((priority) => ({
    ...priority,
    count: incidents.filter(
      (incident) =>
        incident.priority.toUpperCase() === priority.name
    ).length
  }));

  const knownTotal = counts.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const otherCount = total - knownTotal;

  const segments = [
    ...counts,
    {
      name: 'Other',
      label: 'Other',
      color: '#94a3b8',
      count: otherCount
    }
  ];

  let currentPercentage = 0;

  const gradient =
    total === 0
      ? 'conic-gradient(var(--cloud-border) 0% 100%)'
      : `conic-gradient(${segments
          .filter((item) => item.count > 0)
          .map((item) => {
            const start = currentPercentage;
            currentPercentage += (item.count / total) * 100;

            return `${item.color} ${start}% ${currentPercentage}%`;
          })
          .join(', ')})`;

  return (
    <section className="cloudops-card">
      <h2>Incident Priority Distribution</h2>

      <p style={{ color: 'var(--cloud-muted)' }}>
        Current incidents grouped by severity
      </p>

      <div className="severity-chart-layout">
        <div
          className="severity-donut"
          style={{ background: gradient }}
          role="img"
          aria-label={`Priority distribution across ${total} incidents`}
        >
          <div className="severity-donut-center">
            <strong>{total}</strong>
            <span>Total</span>
          </div>
        </div>

        <div className="severity-legend">
          {segments.map((item) => (
            <div className="severity-legend-row" key={item.name}>
              <span
                className="severity-legend-dot"
                style={{ backgroundColor: item.color }}
              />

              <span>
                {item.name} {item.label !== item.name && item.label}
              </span>

              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SeverityChart;
