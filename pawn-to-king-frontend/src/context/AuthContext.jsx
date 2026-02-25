import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getDashboard, loginUser } from "../api/apiService";

const AuthContext = createContext(null);
const TOKEN_KEY = "ptk_token";

const normalizeDashboard = (dashboard) => {
  const progressObject =
    dashboard?.progress && typeof dashboard.progress === "object" ? dashboard.progress : {};
  const userLevel = progressObject.currentLevel || dashboard?.user?.currentLevel || "Pawn";
  const userTopic = progressObject.currentTopic || dashboard?.user?.currentTopic || 1;
  const completedTopics = progressObject.completedTopics ?? dashboard?.completedTopics ?? 0;
  const totalTopics = progressObject.totalTopics ?? dashboard?.totalTopics ?? 20;
  const homeworkLink = dashboard?.homeworkLink || "";

  const fallbackPercent =
    totalTopics > 0 ? Math.round((Number(completedTopics) / Number(totalTopics)) * 100) : 0;
  const percentage =
    progressObject.percentage ??
    dashboard?.progressPercentage ??
    (typeof dashboard?.progress === "number" ? dashboard.progress : fallbackPercent);

  return {
    ...dashboard,
    homeworkLink,
    user: {
      ...dashboard?.user,
      currentLevel: userLevel,
      currentTopic: userTopic
    },
    progress: {
      currentLevel: userLevel,
      currentTopic: userTopic,
      completedTopics: Number(completedTopics) || 0,
      totalTopics: Number(totalTopics) || 20,
      percentage: Math.max(0, Math.min(100, Number(percentage) || 0))
    },
    progressPercentage: Math.max(0, Math.min(100, Number(percentage) || 0)),
    completedTopics: Number(completedTopics) || 0,
    totalTopics: Number(totalTopics) || 20
  };
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const dashboard = await getDashboard();
    const normalizedDashboard = normalizeDashboard(dashboard);
    setProfile(normalizedDashboard);
    return normalizedDashboard;
  }, []);

  const handleAuthSuccess = useCallback(
    async (authResponse) => {
      localStorage.setItem(TOKEN_KEY, authResponse.token);
      setToken(authResponse.token);
      await refreshProfile();
    },
    [refreshProfile]
  );

  const login = useCallback(
    async (payload) => {
      const response = await loginUser(payload);
      await handleAuthSuccess(response);
      return response;
    },
    [handleAuthSuccess]
  );

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } catch (_error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token, refreshProfile, logout]);

  const value = useMemo(
    () => ({
      token,
      profile,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshProfile
    }),
    [token, profile, loading, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
