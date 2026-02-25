import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import CoachPage from "./pages/CoachPage";
import CurriculumPage from "./pages/CurriculumPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import HomeworkPage from "./pages/HomeworkPage";
import ClassroomPage from "./pages/ClassroomPage";
import BonusPage from "./pages/BonusPage";
import TimetablePage from "./pages/TimetablePage";
import CurriculumLevelPage from "./pages/CurriculumLevelPage";
import TopicDetailPage from "./pages/TopicDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminPage from "./pages/AdminPage";
import AdminConfigPage from "./pages/AdminConfigPage";
import AdminTimetablePage from "./pages/AdminTimetablePage";
import AdminCurriculumPage from "./pages/AdminCurriculumPage";
import AdminBatchPage from "./pages/AdminBatchPage";

const publicRoutes = [
  { path: "/", element: <LandingPage /> },
  { path: "/coach", element: <CoachPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/join", element: <RegisterPage /> }
];

const protectedRoutes = [
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/curriculum", element: <CurriculumPage /> },
  { path: "/curriculum/:level", element: <CurriculumLevelPage /> },
  { path: "/topic/:level/:topicNumber", element: <TopicDetailPage /> },
  { path: "/homework", element: <HomeworkPage /> },
  { path: "/classroom", element: <ClassroomPage /> },
  { path: "/timetable", element: <TimetablePage /> },
  { path: "/bonus", element: <BonusPage /> },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminPage />
      </AdminRoute>
    )
  },
  {
    path: "/admin/config",
    element: (
      <AdminRoute>
        <AdminConfigPage />
      </AdminRoute>
    )
  },
  {
    path: "/admin/timetable",
    element: (
      <AdminRoute>
        <AdminTimetablePage />
      </AdminRoute>
    )
  },
  {
    path: "/admin/batches",
    element: (
      <AdminRoute>
        <AdminBatchPage />
      </AdminRoute>
    )
  },
  {
    path: "/admin/curriculum",
    element: (
      <AdminRoute>
        <AdminCurriculumPage />
      </AdminRoute>
    )
  }
];

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {protectedRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/about" element={<Navigate to="/coach" replace />} />
      <Route path="/register" element={<Navigate to="/join" replace />} />
      <Route path="/dashboard/curriculum" element={<Navigate to="/curriculum" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
