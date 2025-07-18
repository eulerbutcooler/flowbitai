import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div data-cy="dashboard">
      <div className="header">
        <h1>Dashboard</h1>
        <div className="tenant-info">Welcome to your tenant dashboard</div>
      </div>

      <div
        style={{
          padding: "20px",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h3>System Overview</h3>
        <p>
          This is the main dashboard where you can see an overview of your
          tenant&apos;s data and activities.
        </p>

        <div style={{ marginTop: "20px" }}>
          <h4>Quick Actions</h4>
          <ul>
            <li>View support tickets</li>
            <li>Manage users</li>
            <li>Configure settings</li>
            <li>View analytics</li>
          </ul>
        </div>

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "6px",
          }}
        >
          <strong>Note:</strong> This is a demo dashboard. In a real
          application, this would show actual metrics, charts, and actionable
          data specific to your tenant.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
