import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Layout from "./Layout";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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

export default DashboardLayout;
