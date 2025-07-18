const request = require("supertest");

const API_URL = "http://localhost:3000";

describe("Screens API Integration Tests", () => {
  let logisticsToken;
  let retailToken;
  let unknownToken;

  beforeAll(async () => {
    try {
      // Use seeded users instead of registering new ones
      const logisticsLogin = await request(API_URL)
        .post("/api/auth/login")
        .send({
          email: "admin@logisticsco.com",
          password: "admin123",
        });

      logisticsToken = logisticsLogin.body.data.token;

      const retailLogin = await request(API_URL)
        .post("/api/auth/login")
        .send({
          email: "admin@retailgmbh.com",
          password: "admin123",
        });

      retailToken = retailLogin.body.data.token;

      // Register a test user for unknown tenant testing
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

      unknownToken = unknownLogin.body.data.token;
    } catch (error) {
      console.log("Error setting up test users:", error);
    }
  });

  it("should return screens for logisticsco tenant", async () => {
    const response = await request(API_URL)
      .get("/api/me/screens")
      .set("Authorization", `Bearer ${logisticsToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tenant).toBe("logisticsco");
    expect(response.body.data.tenantName).toBe("LogisticsCo");
    expect(response.body.data.screens).toHaveLength(1);
    expect(response.body.data.screens[0].id).toBe("support-tickets");
  });

  it("should return screens for retailgmbh tenant", async () => {
    const response = await request(API_URL)
      .get("/api/me/screens")
      .set("Authorization", `Bearer ${retailToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tenant).toBe("retailgmbh");
    expect(response.body.data.tenantName).toBe("RetailGmbH");
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
    expect(response.body.error).toBe("Invalid token");
  });
});
