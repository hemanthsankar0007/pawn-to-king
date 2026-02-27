/**
 * SemiPublicLayout — renders curriculum (and similar pages) for everyone.
 * - Logged-in users  → full dashboard experience (sidebar + dashboard wrapper)
 * - Guest users      → public header/footer, no sidebar
 */
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "./Layout";
import Sidebar from "./Sidebar";
import LoadingSpinner from "./LoadingSpinner";

function SemiPublicLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // Authenticated — show with sidebar (same as DashboardLayout)
  if (isAuthenticated) {
    return (
      <Layout mainClassName="dashboard-main">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="dashboard-content min-w-0 lg:pl-72">
          <div className="container min-w-0">
            <div className="mb-3 lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-lg border border-gold/25 bg-surface transition-colors hover:border-gold/50"
              >
                <span className="block h-[2px] w-5 rounded-full bg-gold" />
                <span className="block h-[2px] w-5 rounded-full bg-gold" />
                <span className="block h-[2px] w-5 rounded-full bg-gold" />
              </button>
            </div>
            <div className="min-w-0 pb-8 md:pb-10">
              <Outlet />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Guest — show with public header + footer, no sidebar
  return (
    <Layout showFooter>
      <div className="container">
        <Outlet />
      </div>
    </Layout>
  );
}

export default SemiPublicLayout;
