type Props = {
  priority: string;
  status: string;
};

function StatusBar({ priority, status }: Props) {
  return (
    <div>
      <h2>Incident Status</h2>
      <p>Priority: {priority}</p>
      <p>Status: {status}</p>
    </div>
  );
}

export default StatusBar;
