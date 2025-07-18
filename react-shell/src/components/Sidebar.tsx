import React from "react";
import { Screen } from "../types";

interface SidebarProps {
  screens: Screen[];
  activeScreen: string | null;
  onScreenSelect: (_screen: Screen) => void;
  tenantName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  screens,
  activeScreen,
  onScreenSelect,
  tenantName,
}) => {
  return (
    <div className="sidebar">
      <div className="header">
        <h1>Flowbit AI</h1>
        {tenantName && <div className="tenant-info">Tenant: {tenantName}</div>}
      </div>

      <nav>
        <div
          className={`nav-item ${!activeScreen ? "active" : ""}`}
          data-cy="dashboard-nav"
          onClick={() =>
            onScreenSelect({
              id: "dashboard",
              name: "Dashboard",
              url: "",
              scope: "",
              module: "",
              route: "/dashboard",
            })
          }
        >
          Dashboard
        </div>

        {screens.map((screen) => (
          <div
            key={screen.id}
            className={`nav-item ${activeScreen === screen.id ? "active" : ""}`}
            data-cy={`${screen.name.toLowerCase().replace(/\s+/g, "-")}-nav`}
            onClick={() => onScreenSelect(screen)}
          >
            {screen.name}
          </div>
        ))}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <button
          className="btn"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
          style={{ fontSize: "14px", padding: "8px 16px" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
