import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text">
        <div className="rounded-xl border border-gold/30 bg-card px-6 py-4 text-sm">
          Loading admin access...
        </div>
      </div>
    );
  }

  if (profile?.user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;
