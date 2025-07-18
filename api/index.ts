import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import ticketRoutes from "./routes/tickets";
import screenRoutes from "./routes/screen";
import auditRoutes from "./routes/audit";
import { authenticateJWT, requireAdmin } from "./middleware/authMiddleware";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api", screenRoutes);
app.use("/api/audit", auditRoutes);

app.get("/api/admin/secret", authenticateJWT, requireAdmin, (req, res) => {
  res.json({ message: "Admin-only route" });
});

const PORT = process.env.PORT || 4000;

async function testConnection() {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

app.listen(PORT, async () => {
  console.log(`API running on port ${PORT}`);
  await testConnection();
});
