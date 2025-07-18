import React, { Suspense } from "react";
import { Screen } from "../types";

const SupportTicketsApp = React.lazy(() =>
  import("supportApp/SupportTicketsApp").catch(() => ({
    default: () => (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h3>Support Tickets App</h3>
        <p>
          The micro-frontend could not be loaded. In a real scenario, this would
          be the Support Tickets application.
        </p>
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "6px",
          }}
        >
          <strong>Demo Mode:</strong> This demonstrates where the remote Support
          Tickets micro-frontend would load via Webpack Module Federation.
        </div>
      </div>
    ),
  }))
);

interface RemoteAppLoaderProps {
  screen: Screen;
}

const RemoteAppLoader: React.FC<RemoteAppLoaderProps> = ({ screen }) => {
  // In a real implementation, this would dynamically load different apps based on screen.scope and screen.module
  if (screen.id === "support-tickets") {
    return (
      <Suspense
        fallback={
          <div style={{ padding: "20px" }}>Loading Support Tickets App...</div>
        }
      >
        <SupportTicketsApp />
      </Suspense>
    );
  }

  // Fallback for other screens
  return (
    <div style={{ padding: "20px" }}>
      <div className="header">
        <h1>{screen.name}</h1>
        <div className="tenant-info">
          Remote application: {screen.scope}/{screen.module}
        </div>
      </div>

      <div
        style={{
          padding: "20px",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <p>This would load the remote micro-frontend:</p>
        <ul>
          <li>
            <strong>Screen ID:</strong> {screen.id}
          </li>
          <li>
            <strong>URL:</strong> {screen.url}
          </li>
          <li>
            <strong>Scope:</strong> {screen.scope}
          </li>
          <li>
            <strong>Module:</strong> {screen.module}
          </li>
          <li>
            <strong>Route:</strong> {screen.route}
          </li>
        </ul>

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#e3f2fd",
            borderRadius: "6px",
          }}
        >
          <strong>Note:</strong> In a production setup, this component would use
          Webpack Module Federation to dynamically load and render the specified
          micro-frontend.
        </div>
      </div>
    </div>
  );
};

export default RemoteAppLoader;
