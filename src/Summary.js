export default function Summary({ report }) {
  if (!report) return <p>No data available</p>;

  const { summary } = report;

  return (
    <div style={{ padding: 20 }}>
      <h2>Analysis Summary</h2>

      <ul>
        <li>Total Accounts: {summary.total_accounts}</li>
        <li>Total Rings: {summary.total_rings}</li>
        <li>Processing Time: {summary.processing_time_seconds}s</li>
      </ul>
    </div>
  );
}
