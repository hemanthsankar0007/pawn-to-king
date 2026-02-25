import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="text-center max-w-lg">
        {/* Large decorative 404 */}
        <p
          className="font-display text-[8rem] leading-none font-bold"
          style={{
            background: "linear-gradient(135deg, #b8952e 0%, #e8c84a 45%, #d4af37 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          404
        </p>

        <h1 className="mt-4 font-display text-3xl font-semibold text-text">
          Page Not Found
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-text/65">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="mt-8 inline-block rounded-xl px-8 py-4 text-base font-semibold text-bg shadow-xl transition-all duration-300 hover:scale-105"
          style={{
            background: "linear-gradient(90deg, #b8952e 0%, #e8c84a 45%, #d4af37 100%)",
            boxShadow: "0 0 28px rgba(212,175,55,0.3)"
          }}
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

