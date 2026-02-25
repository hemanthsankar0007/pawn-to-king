import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "./Layout";
import LoadingSpinner from "./LoadingSpinner";

function PublicLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout showFooter>
      <div className="container">
        <Outlet />
      </div>
    </Layout>
  );
}

export default PublicLayout;
