import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import { authenticateJWT, requireAdmin } from "./middleware/authMiddleware";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/admin/secret", authenticateJWT, requireAdmin, (req, res) => {
  res.json({ message: "Admin-only route" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
