const request = require("supertest");

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "flowbit-webhook-secret";
const API_URL = "http://localhost:3000";

describe("Webhook Integration Tests", () => {
  let userToken;
  let ticketId;

  beforeAll(async () => {
    try {
      const loginResponse = await request(API_URL).post("/api/auth/login").send({
        email: "admin@logisticsco.com",
        password: "admin123",
      });
      userToken = loginResponse.body.token;
    } catch (error) {
      console.log("Login failed:", error.message);
    }
  }, 30000);

  it("should create a ticket and send webhook", async () => {
    const response = await request(API_URL)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Test Webhook Ticket",
        description: "Testing webhook integration",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Ticket created");
    expect(response.body.ticket.status).toBe("pending");

    ticketId = response.body.ticket.id;
  });

  it("should handle webhook callback with correct secret", async () => {
    const response = await request(API_URL)
      .post("/api/tickets/webhook/ticket-done")
      .set("x-webhook-secret", WEBHOOK_SECRET)
      .send({
        ticketId: ticketId,
        status: "completed",
        customerId: "rolling-stones",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.ticket.status).toBe("completed");
  });

  it("should reject webhook with wrong secret", async () => {
    const response = await request(API_URL)
      .post("/api/tickets/webhook/ticket-done")
      .set("x-webhook-secret", "wrong-secret")
      .send({
        ticketId: ticketId,
        status: "completed",
        customerId: "rolling-stones",
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Unauthorized webhook");
  });

  it("should reject webhook with missing fields", async () => {
    const response = await request(API_URL)
      .post("/api/tickets/webhook/ticket-done")
      .set("x-webhook-secret", WEBHOOK_SECRET)
      .send({
        ticketId: ticketId,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Missing required fields");
  });

  it("should enforce tenant isolation in webhook", async () => {
    const response = await request(API_URL)
      .post("/api/tickets/webhook/ticket-done")
      .set("x-webhook-secret", WEBHOOK_SECRET)
      .send({
        ticketId: ticketId,
        status: "completed",
        customerId: "wrong-tenant",
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Ticket not found");
  });

  it("should verify ticket status was updated", async () => {
    const response = await request(API_URL)
      .get("/api/tickets")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    const ticket = response.body.find((t) => t.id === ticketId);
    expect(ticket.status).toBe("completed");
  });
});
