import { PrismaClient, Prisma } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    customerId: string;
    email?: string;
    id?: string;
  };
}

export interface AuditLogData {
  action: string;
  userId: string;
  tenant: string;
  resourceType?: string;
  resourceId?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(data: AuditLogData) {
    try {
      await prisma.auditLog.create({
        data: {
          action: data.action,
          userId: data.userId,
          tenant: data.tenant,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  }

  static async logFromRequest(
    req: AuthenticatedRequest,
    action: string,
    resourceType?: string,
    resourceId?: string,
    details?: Prisma.InputJsonValue
  ) {
    const user = req.user;
    if (!user) return;

    await this.log({
      action,
      userId: user.userId || user.id || user.email || "unknown",
      tenant: user.customerId,
      resourceType,
      resourceId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });
  }

  static async getAuditLogs(
    tenant: string,
    options: {
      page?: number;
      limit?: number;
      userId?: string;
      action?: string;
      resourceType?: string;
      from?: Date;
      to?: Date;
    } = {}
  ) {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      resourceType,
      from,
      to,
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = { tenant };

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
