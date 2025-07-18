import express from "express";
import { authenticateJWT, requireAdmin } from "../middleware/authMiddleware";
import { AuditLogger } from "../models/AuditLog";

interface AuthenticatedRequest extends express.Request {
  user?: {
    userId: string;
    customerId: string;
    role: string;
  };
}

const router = express.Router();

router.get("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const {
      page = 1,
      limit = 50,
      action,
      resourceType,
      userId,
      from,
      to,
    } = req.query;

    const options = {
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100),
      action: action as string,
      resourceType: resourceType as string,
      userId: userId as string,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
    };

    const result = await AuditLogger.getAuditLogs(user.customerId, options);

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audit logs",
    });
  }
});

router.get("/admin/all", authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      resourceType,
      userId,
      tenant,
      from,
      to,
    } = req.query;

    const options = {
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100),
      action: action as string,
      resourceType: resourceType as string,
      userId: userId as string,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
    };

    const result = await AuditLogger.getAuditLogs(
      (tenant as string) || "",
      options
    );

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching admin audit logs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audit logs",
    });
  }
});

router.get("/stats", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { from, to } = req.query;

    const dateFilter: Record<string, unknown> = {};
    if (from || to) {
      dateFilter.timestamp = {};
      if (from) (dateFilter.timestamp as Record<string, Date>).gte = new Date(from as string);
      if (to) (dateFilter.timestamp as Record<string, Date>).lte = new Date(to as string);
    }

    const stats = {
      totalEvents: await AuditLogger.getAuditLogs(user.customerId, {
        limit: 1,
      }).then((r) => r.pagination.total),
      recentEvents: await AuditLogger.getAuditLogs(user.customerId, {
        limit: 10,
      }).then((r) => r.logs.length),
      message: "Audit log statistics (simplified implementation)",
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching audit log stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audit log statistics",
    });
  }
});

export default router;
