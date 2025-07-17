import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT } from "../middleware/authMiddleware";
import axios from "axios";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", authenticateJWT, async (req, res) => {
  const { title, description } = req.body;
  const user = (req as any).user;

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        status: "pending",
        customerId: user.customerId,
        createdBy: user.userId,
      },
    });

    try {
      await axios.post("http://n8n:5678/webhook/test", {
        ticketId: ticket.id,
        customerId: user.customerId,
      });
    } catch (webhookError: any) {
      // Webhook failure is non-critical
    }

    res.json({ message: "Ticket created", ticket });
  } catch (err) {
    res.status(500).json({ error: "Could not create ticket" });
  }
});

router.get("/", authenticateJWT, async (req, res) => {
  const user = (req as any).user;

  try {
    const tickets = await prisma.ticket.findMany({
      where: { customerId: user.customerId },
      orderBy: { createdAt: "desc" },
    });

    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch tickets" });
  }
});

export default router;
