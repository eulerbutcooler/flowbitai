import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { signToken } from "../utils/jwt";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  const { email, password, role, customerId } = req.body;
  console.log("Registration attempt:", { email, role, customerId });
  
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashed, role, customerId },
    });
    console.log("User created successfully:", user.id);
    res.json({ message: "User created", userId: user.id });
  } catch (e: any) {
    console.error("Registration error:", e);
    if (e.code === 'P2002') {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Registration failed", details: e.message });
    }
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(403).json({ error: "Invalid password" });

  const token = signToken({
    userId: user.id,
    role: user.role,
    customerId: user.customerId,
  });

  res.json({ token });
});

export default router;
