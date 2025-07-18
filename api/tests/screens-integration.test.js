const request = require("supertest");

const API_URL = "http://localhost:3000";

describe("Screens API Integration Tests", () => {
  let rollingStoneToken;
  let delhiveryToken;
  let unknownToken;

  beforeAll(async () => {
    try {
      await request(API_URL).post("/api/auth/register").send({
        email: "admin@rolling-stones.com",
        password: "password123",
        customerId: "rolling-stones",
        role: "ADMIN",
      });

      const rollingStoneLogin = await request(API_URL)
        .post("/api/auth/login")
        .send({
          email: "admin@rolling-stones.com",
          password: "password123",
        });

      rollingStoneToken = rollingStoneLogin.body.token;

      await request(API_URL).post("/api/auth/register").send({
        email: "admin@delhivery.com",
        password: "password123",
        customerId: "delhivery",
        role: "ADMIN",
      });

      const delhiveryLogin = await request(API_URL).post("/api/auth/login").send({
        email: "admin@delhivery.com",
        password: "password123",
      });

      delhiveryToken = delhiveryLogin.body.token;

      await request(API_URL).post("/api/auth/register").send({
        email: "admin@unknown-tenant.com",
        password: "password123",
        customerId: "unknown-tenant",
        role: "ADMIN",
      });

      const unknownLogin = await request(API_URL).post("/api/auth/login").send({
        email: "admin@unknown-tenant.com",
        password: "password123",
      });

      unknownToken = unknownLogin.body.token;
    } catch (error) {
      console.log("Error setting up test users:", error);
    }
  });

  it("should return screens for rolling-stones tenant", async () => {
    const response = await request(API_URL)
      .get("/api/me/screens")
      .set("Authorization", `Bearer ${rollingStoneToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tenant).toBe("rolling-stones");
    expect(response.body.data.tenantName).toBe("Rolling Stones ltd.");
    expect(response.body.data.screens).toHaveLength(1);
    expect(response.body.data.screens[0].id).toBe("support-tickets");
  });

  it("should return screens for delhivery tenant", async () => {
    const response = await request(API_URL)
      .get("/api/me/screens")
      .set("Authorization", `Bearer ${delhiveryToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tenant).toBe("delhivery");
    expect(response.body.data.tenantName).toBe("Delhivery corp.");
    expect(response.body.data.screens).toHaveLength(1);
  });

  it("should return empty screens for unknown tenant", async () => {
    const response = await request(API_URL)
      .get("/api/me/screens")
      .set("Authorization", `Bearer ${unknownToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tenant).toBe("unknown-tenant");
    expect(response.body.data.screens).toHaveLength(0);
  });

  it("should require authentication", async () => {
    const response = await request(API_URL).get("/api/me/screens");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Missing token");
  });

  it("should reject invalid token", async () => {
    const response = await request(API_URL)
      .get("/api/me/screens")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Invalid token");
  });
});
