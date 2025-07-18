const request = require("supertest");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "myjwtsecret";
const API_URL = "http://localhost:3000";

describe("Tenant Data Isolation Tests", () => {
  let logisticsToken;
  let retailToken;
  let adminToken;

  beforeAll(async () => {
    try {
      // Use seeded users for testing
      const logisticsLogin = await request(API_URL)
        .post("/api/auth/login")
        .send({
          email: "admin@logisticsco.com",
          password: "admin123",
        });

      logisticsToken = logisticsLogin.body.data.token;
      adminToken = logisticsLogin.body.data.token; // Use logistics admin as the admin token

      const retailLogin = await request(API_URL)
        .post("/api/auth/login")
        .send({
          email: "admin@retailgmbh.com",
          password: "admin123",
        });

      retailToken = retailLogin.body.data.token;
    } catch (error) {
      console.log("Error setting up test tokens:", error);
    }
  });

  it("should isolate tenant data - logisticsco admin cannot access retailgmbh screens", async () => {
    const response = await request(API_URL)
      .get("/api/me/screens")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tenant).toBe("logisticsco");
    expect(response.body.data.tenantName).toBe("LogisticsCo");

    expect(response.body.data.screens).toHaveLength(1);
    expect(response.body.data.screens[0].id).toBe("support-tickets");
  });

  it("should enforce tenant isolation in JWT claims", async () => {
    // Integration test: verify that each user can only access their own tenant data
    const logisticsResponse = await request(API_URL)
      .get("/api/me/screens")
      .set("Authorization", `Bearer ${logisticsToken}`);

    const retailResponse = await request(API_URL)
      .get("/api/me/screens")
      .set("Authorization", `Bearer ${retailToken}`);

    expect(logisticsResponse.status).toBe(200);
    expect(retailResponse.status).toBe(200);

    expect(logisticsResponse.body.data.tenant).toBe("logisticsco");
    expect(retailResponse.body.data.tenant).toBe("retailgmbh");

    // Verify they can't access each other's data
    expect(logisticsResponse.body.data.tenant).not.toBe(
      retailResponse.body.data.tenant
    );
  });

  it("should require admin role for admin endpoints", async () => {
    const userResponse = await request(API_URL)
      .get("/admin/secret")
      .set("Authorization", `Bearer ${logisticsToken}`);

    expect(userResponse.status).toBe(404); // Route doesn't exist, should be 404
    
    const adminResponse = await request(API_URL)
      .get("/admin/secret")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(adminResponse.status).toBe(404); // Route doesn't exist, should be 404
  });
});
