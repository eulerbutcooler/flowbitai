const request = require("supertest");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "myjwtsecret";
const API_URL = "http://localhost:3000";

describe("Tenant Data Isolation Tests", () => {
  let rollingStoneToken;
  let delhiveryToken;
  let adminToken;

  beforeAll(async () => {
    try {
      await request(API_URL).post("/auth/register").send({
        email: "admin@rolling-stones.com",
        password: "password123",
        customerId: "rolling-stones",
        role: "ADMIN",
      });

      const adminLogin = await request(API_URL).post("/auth/login").send({
        email: "admin@rolling-stones.com",
        password: "password123",
      });

      adminToken = adminLogin.body.token;
    } catch (error) {
      console.log("Admin user exists, getting token...");
    }

    try {
      const rollingStoneLogin = await request(API_URL)
        .post("/auth/login")
        .send({
          email: "test@rolling-stones.com",
          password: "password123",
        });

      rollingStoneToken = rollingStoneLogin.body.token;

      const delhiveryLogin = await request(API_URL).post("/auth/login").send({
        email: "test@delhivery.com",
        password: "password123",
      });

      delhiveryToken = delhiveryLogin.body.token;
    } catch (error) {
      console.log("Error getting tokens:", error.message);
    }
  }, 30000);

  it("should isolate tenant data - rolling-stones admin cannot access delhivery screens", async () => {
    const response = await request(API_URL)
      .get("/api/me/screens")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tenant).toBe("rolling-stones");
    expect(response.body.data.tenantName).toBe("Rolling Stones ltd.");

    expect(response.body.data.screens).toHaveLength(1);
    expect(response.body.data.screens[0].id).toBe("support-tickets");
  });

  it("should enforce tenant isolation in JWT claims", async () => {
    const rollingStoneDecoded = jwt.verify(rollingStoneToken, JWT_SECRET);
    const delhiveryDecoded = jwt.verify(delhiveryToken, JWT_SECRET);

    expect(rollingStoneDecoded.customerId).toBe("rolling-stones");
    expect(delhiveryDecoded.customerId).toBe("delhivery");

    expect(rollingStoneDecoded.customerId).not.toBe(
      delhiveryDecoded.customerId
    );
  });

  it("should require admin role for admin endpoints", async () => {
    const userResponse = await request(API_URL)
      .get("/admin/secret")
      .set("Authorization", `Bearer ${rollingStoneToken}`);

    expect(userResponse.status).toBe(403);
    expect(userResponse.body.message).toBe("Admins only");

    const adminResponse = await request(API_URL)
      .get("/admin/secret")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.message).toBe("Admin-only route");
  });
});
