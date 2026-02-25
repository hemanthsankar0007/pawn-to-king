function StatusMessage({ type = "info", text, className = "" }) {
  if (!text) {
    return null;
  }

  const variants = {
    success: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    error: "border-amber-400/40 bg-amber-400/10 text-amber-200",
    warning: "border-amber-400/40 bg-amber-400/10 text-amber-200",
    info: "border-gold/35 bg-gold/10 text-gold"
  };

  const variantClass = variants[type] || variants.info;

  return (
    <p className={`rounded-md border px-3 py-2 text-sm ${variantClass} ${className}`.trim()}>
      {text}
    </p>
  );
}

export default StatusMessage;
