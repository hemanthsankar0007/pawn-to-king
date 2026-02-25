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

      <div className="dashboard-content lg:pl-72">
        <div className="container">
          <div className="mb-4 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="secondary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-4 text-sm font-semibold"
            >
              Open Menu
            </button>
          </div>

          <div className="pb-8 md:pb-10">
            <Outlet />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default DashboardLayout;
