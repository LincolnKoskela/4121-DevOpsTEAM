import { useState } from 'react';

export type CloudOpsPage =
  | 'Overview'
  | 'Incidents'
  | 'Alerts'
  | 'Runbooks';

type Props = {
  page: CloudOpsPage;
  onNavigate: (page: CloudOpsPage) => void;
};

const navigation: {
  page: CloudOpsPage;
  icon: string;
  description: string;
}[] = [
  { page: 'Overview', icon: '◫', description: 'Dashboard' },
  { page: 'Incidents', icon: '⚡', description: 'Incident management' },
  { page: 'Alerts', icon: '◉', description: 'Security events' },
  { page: 'Runbooks', icon: '☷', description: 'Recovery procedures' }
];

function CloudOpsSidebar({ page, onNavigate }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function navigate(destination: CloudOpsPage) {
    onNavigate(destination);
    setMobileOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="cloudops-mobile-menu cloudops-button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-expanded={mobileOpen}
        aria-controls="cloudops-sidebar"
      >
        {mobileOpen ? '✕ Close menu' : '☰ Menu'}
      </button>

      <aside
        id="cloudops-sidebar"
        className={`cloudops-sidebar ${mobileOpen ? 'is-open' : ''}`}
      >
        <div className="cloudops-sidebar-brand">
          <div className="cloudops-brand-icon">☁</div>

          <div>
            <strong>CloudOps</strong>
            <small>CONTROL TOWER</small>
          </div>
        </div>

        <div className="cloudops-sidebar-section-label">
          WORKSPACE
        </div>

        <nav aria-label="CloudOps navigation">
          {navigation.map((item) => (
            <button
              key={item.page}
              type="button"
              className={`cloudops-sidebar-link ${
                page === item.page ? 'is-active' : ''
              }`}
              aria-current={page === item.page ? 'page' : undefined}
              onClick={() => navigate(item.page)}
              title={item.description}
            >
              <span className="cloudops-sidebar-icon" aria-hidden="true">
                {item.icon}
              </span>

              <span>{item.page}</span>
            </button>
          ))}
        </nav>

        <div className="cloudops-sidebar-footer">
          <span className="cloudops-sidebar-status-dot" />
          <span>Incident Command</span>
          <small>DevSecOps Project</small>
        </div>
      </aside>
    </>
  );
}

export default CloudOpsSidebar;
