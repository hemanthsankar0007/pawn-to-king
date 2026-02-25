import LoadingSpinner from "./LoadingSpinner";

function LoadingPanel({ text = "Loading..." }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <LoadingSpinner size="md" />
      <p className="text-xs uppercase tracking-[0.18em] text-text/50">{text}</p>
    </div>
  );
}

export default LoadingPanel;
