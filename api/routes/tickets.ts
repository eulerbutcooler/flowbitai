import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT } from "../middleware/authMiddleware";
import { AuditLogger } from "../models/AuditLog";
import axios from "axios";

const router = express.Router();
const prisma = new PrismaClient();

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  throw new Error("WEBHOOK_SECRET environment variable is required");
}

router.post("/", authenticateJWT, async (req, res) => {
  const { title, description } = req.body;
  const user = (req as any).user;

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        status: "pending",
        priority: "high",
        customerId: user.customerId,
        createdBy: user.userId,
      },
    });

    await AuditLogger.logFromRequest(
      req,
      "TICKET_CREATED",
      "ticket",
      ticket.id,
      {
        title,
        description,
        status: "pending",
      }
    );

    try {
      await axios.post("http://n8n:5678/webhook/ticket-created", {
        ticketId: ticket.id,
        customerId: user.customerId,
        callbackUrl: `${
          process.env.API_URL || "http://api:3000"
        }/api/tickets/webhook/ticket-done`,
        webhookSecret: WEBHOOK_SECRET,
      });
    } catch (webhookError: any) {}

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

    res.json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Could not fetch tickets",
    });
  }
});

router.post("/webhook/ticket-done", async (req, res) => {
  try {
    const secret = req.headers["x-webhook-secret"];
    if (secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Unauthorized webhook" });
    }

    const { ticketId, status, customerId } = req.body;

    if (!ticketId || !status || !customerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticketId,
        customerId: customerId,
      },
      data: { status },
    });

    await AuditLogger.log({
      action: "TICKET_STATUS_UPDATED",
      userId: "system",
      tenant: customerId,
      resourceType: "ticket",
      resourceId: ticketId,
      details: {
        previousStatus: "pending",
        newStatus: status,
        source: "webhook",
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({
      success: true,
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (err: any) {
    console.error("Webhook error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.status(500).json({ error: "Could not update ticket" });
  }
});

export default router;
