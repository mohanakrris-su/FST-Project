export default function SummaryCard({ label, value, caption }) {
  return (
    <article className="summary-card">
      <p className="summary-card__label">{label}</p>
      <h3 className="summary-card__value">{value}</h3>
      <p className="summary-card__caption">{caption}</p>
    </article>
  );
}
