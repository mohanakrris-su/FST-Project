export default function StatusPill({ value }) {
  const normalized = String(value || "UNKNOWN").toLowerCase();

  return <span className={`status-pill status-pill--${normalized}`}>{value}</span>;
}
