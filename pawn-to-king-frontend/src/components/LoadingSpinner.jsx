function LoadingSpinner({ fullScreen = false, size = "md" }) {
  const sizes = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-[3px]",
    lg: "h-14 w-14 border-4"
  };

  const spinnerClass = sizes[size] || sizes.md;

  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen bg-bg" : "py-10"
      }`}
    >
      <div
        className={`${spinnerClass} animate-spin rounded-full border-gold/25 border-t-gold`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export default LoadingSpinner;
