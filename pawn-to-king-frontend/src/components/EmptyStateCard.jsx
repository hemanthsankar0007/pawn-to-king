function EmptyStateCard({ title, text }) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-gold/80">{title}</p>
      <p className="mt-2 text-sm text-text/75">{text}</p>
    </div>
  );
}

export default EmptyStateCard;
