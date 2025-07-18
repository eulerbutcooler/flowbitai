import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import RemoteAppLoader from "./components/RemoteAppLoader";
import { Screen, ScreensResponse } from "./types";
import { authService } from "./services/authService";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<Screen | null>(null);
  const [tenantName, setTenantName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const screensData: ScreensResponse = await authService.getScreens();
          if (screensData.success) {
            setScreens(screensData.data.screens);
            setTenantName(
              screensData.data.tenantName || screensData.data.tenant
            );
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
          }
        } catch (error) {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const screensData: ScreensResponse = await authService.getScreens();
      if (screensData.success) {
        setScreens(screensData.data.screens);
        setTenantName(screensData.data.tenantName || screensData.data.tenant);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error fetching screens after login:", error);
    }
    setLoading(false);
  };

  const handleScreenSelect = (screen: Screen) => {
    setActiveScreen(screen);
    if (screen.route) {
      navigate(screen.route);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container" data-cy="app-loaded">
      <Sidebar
        screens={screens}
        activeScreen={activeScreen?.id || null}
        onScreenSelect={handleScreenSelect}
        tenantName={tenantName}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {screens.map((screen) => (
            <Route
              key={screen.id}
              path={screen.route}
              element={<RemoteAppLoader screen={screen} />}
            />
          ))}
        </Routes>
      </main>
    </div>
  );
};

export default App;
