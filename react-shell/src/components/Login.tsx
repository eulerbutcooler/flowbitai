import React, { useState } from "react";
import { authService } from "../services/authService";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login(email, password);
      if (response.success) {
        localStorage.setItem("token", response.data.token);
        onLogin();
      } else {
        setError("Login failed");
      }
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2
          style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}
        >
          Flowbit AI Login
        </h2>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            data-cy="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            data-cy="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn"
          data-cy="login-button"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <div className="error-message" data-cy="error-message">
            {error}
          </div>
        )}

        <div
          style={{
            marginTop: "20px",
            fontSize: "12px",
            color: "#666",
            textAlign: "center",
          }}
        >
          Demo credentials:
          <br />
          admin@logisticsco.com / admin123 (LogisticsCo Admin)
          <br />
          admin@retailgmbh.com / admin123 (RetailGmbH Admin)
        </div>
      </form>
    </div>
  );
};

export default Login;
