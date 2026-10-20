import StatusBar from './components/StatusBar';
import IncidentTimeline from './components/IncidentTimeline';
import ResponderList from './components/ResponderList';
import RunbookViewer from './components/RunbookViewer';
import AlertFeed from './components/AlertFeed';

function App() {
  return (
    <div style={{ padding: '30px' }}>
      <h1>Incident Command War Room</h1>

      <StatusBar
        priority="P1"
        status="Investigating"
      />

      <hr />

      <IncidentTimeline />

      <hr />

      <ResponderList />

      <hr />

      <RunbookViewer />

      <hr />

      <AlertFeed />
    </div>
  );
}

export default App;
