import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import ticketRoutes from "./routes/tickets";
import { authenticateJWT, requireAdmin } from "./middleware/authMiddleware";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/api/tickets", ticketRoutes);

app.get("/admin/secret", authenticateJWT, requireAdmin, (req, res) => {
  res.json({ message: "Admin-only route" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`API running on port ${PORT}`);
});
