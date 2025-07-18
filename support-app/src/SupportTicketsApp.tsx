import React, { useState, useEffect } from "react";
import axios from "axios";

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "closed";
  priority: "low" | "medium" | "high";
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

const SupportTicketsApp: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  // Add token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get<ApiResponse<Ticket[]>>("/api/tickets");
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (err) {
      setError("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<ApiResponse<Ticket>>(
        "/api/tickets",
        newTicket
      );
      if (response.data.success) {
        setTickets([response.data.data, ...tickets]);
        setNewTicket({ title: "", description: "", priority: "medium" });
      }
    } catch (err) {
      setError("Failed to create ticket");
    }
  };

  const updateTicketStatus = async (
    ticketId: string,
    newStatus: "open" | "in-progress" | "closed"
  ) => {
    try {
      const response = await api.put<ApiResponse<Ticket>>(
        `/api/tickets/${ticketId}`,
        {
          status: newStatus,
        }
      );

      if (response.data.success) {
        setTickets(
          tickets.map((ticket) =>
            ticket._id === ticketId
              ? {
                  ...ticket,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : ticket
          )
        );
      }
    } catch (err) {
      console.error("Error updating ticket status:", err);
      setError("Failed to update ticket status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#dc3545";
      case "in-progress":
        return "#ffc107";
      case "closed":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#dc3545";
      case "medium":
        return "#ffc107";
      case "low":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading tickets...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          marginBottom: "30px",
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: "0", color: "#333" }}>Support Tickets</h2>
          <button
            data-cy="new-ticket-button"
            onClick={() => setShowNewTicketForm(!showNewTicketForm)}
            style={{
              padding: "10px 20px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {showNewTicketForm ? "Cancel" : "New Ticket"}
          </button>
        </div>
        <p style={{ margin: "0", color: "#666" }}>
          Manage and track your support requests
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "10px",
            background: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* Create New Ticket Form */}
      {showNewTicketForm && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0" }}>Create New Ticket</h3>
          <form onSubmit={createTicket}>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Title
              </label>
              <input
                type="text"
                data-cy="ticket-title-input"
                value={newTicket.title}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, title: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Description
              </label>
              <textarea
                data-cy="ticket-description-input"
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, description: e.target.value })
                }
                required
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  resize: "vertical",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "500",
                }}
              >
                Priority
              </label>
              <select
                data-cy="ticket-priority-select"
                value={newTicket.priority}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    priority: e.target.value as "low" | "medium" | "high",
                  })
                }
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button
              type="submit"
              data-cy="submit-ticket-button"
              style={{
                padding: "10px 20px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Create Ticket
            </button>
          </form>
        </div>
      )}

      {/* Tickets List */}
      <div
        data-cy="tickets-list"
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ margin: "0 0 15px 0" }}>
          Your Tickets ({tickets.length})
        </h3>

        {tickets.length === 0 ? (
          <p
            data-cy="empty-tickets-message"
            style={{ color: "#666", textAlign: "center", padding: "20px" }}
          >
            No tickets found. Create your first ticket above!
          </p>
        ) : (
          <div>
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                data-cy={`ticket-${ticket._id}`}
                style={{
                  border: "1px solid #e9ecef",
                  borderRadius: "6px",
                  padding: "15px",
                  marginBottom: "15px",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 4px 8px rgba(0,0,0,0.1)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <h4 style={{ margin: "0", color: "#333" }}>{ticket.title}</h4>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: getStatusColor(ticket.status),
                        color: "white",
                      }}
                    >
                      {ticket.status}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: getPriorityColor(ticket.priority),
                        color: "white",
                      }}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <p style={{ margin: "0 0 10px 0", color: "#666" }}>
                  {ticket.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    Created: {new Date(ticket.createdAt).toLocaleDateString()} |
                    Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <label style={{ fontSize: "12px", color: "#666" }}>
                      Status:
                    </label>
                    <select
                      data-cy="status-select"
                      value={ticket.status}
                      onChange={(e) =>
                        updateTicketStatus(
                          ticket._id,
                          e.target.value as "open" | "in-progress" | "closed"
                        )
                      }
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsApp;
