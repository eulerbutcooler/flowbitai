import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { AuditLogger } from "../models/AuditLog";

describe("Audit Log Integration", () => {
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
  });

  it("should create audit log entries for ticket operations", async () => {
    const testUserId = "test-user-123";
    const testTenant = "test-tenant";
    const testTicketId = "test-ticket-456";

    await AuditLogger.log({
      action: "TICKET_CREATED",
      userId: testUserId,
      tenant: testTenant,
      resourceType: "ticket",
      resourceId: testTicketId,
      details: {
        title: "Test Ticket",
        description: "Test Description",
        status: "pending",
      },
      ipAddress: "127.0.0.1",
      userAgent: "Jest Test Agent",
    });

    const result = await AuditLogger.getAuditLogs(testTenant, {
      page: 1,
      limit: 10,
    });

    expect(result.logs).toBeDefined();
    expect(result.logs.length).toBeGreaterThan(0);

    const auditLog = result.logs.find((log) => log.resourceId === testTicketId);
    expect(auditLog).toBeDefined();
    expect(auditLog?.action).toBe("TICKET_CREATED");
    expect(auditLog?.userId).toBe(testUserId);
    expect(auditLog?.tenant).toBe(testTenant);
    expect(auditLog?.resourceType).toBe("ticket");
  });

  it("should enforce tenant isolation in audit logs", async () => {
    const tenant1 = "tenant-1";
    const tenant2 = "tenant-2";

    await AuditLogger.log({
      action: "TEST_ACTION_1",
      userId: "user-1",
      tenant: tenant1,
      resourceType: "test",
      resourceId: "resource-1",
    });

    await AuditLogger.log({
      action: "TEST_ACTION_2",
      userId: "user-2",
      tenant: tenant2,
      resourceType: "test",
      resourceId: "resource-2",
    });

    const tenant1Logs = await AuditLogger.getAuditLogs(tenant1);

    const tenant2Logs = await AuditLogger.getAuditLogs(tenant2);

    expect(tenant1Logs.logs.every((log) => log.tenant === tenant1)).toBe(true);
    expect(tenant2Logs.logs.every((log) => log.tenant === tenant2)).toBe(true);

    expect(tenant1Logs.logs.some((log) => log.tenant === tenant2)).toBe(false);
    expect(tenant2Logs.logs.some((log) => log.tenant === tenant1)).toBe(false);
  });

  it("should support filtering audit logs by action and resource type", async () => {
    const testTenant = "filter-test-tenant";

    await AuditLogger.log({
      action: "TICKET_CREATED",
      userId: "user-1",
      tenant: testTenant,
      resourceType: "ticket",
      resourceId: "ticket-1",
    });

    await AuditLogger.log({
      action: "USER_LOGIN",
      userId: "user-1",
      tenant: testTenant,
      resourceType: "authentication",
      resourceId: "auth-1",
    });

    const ticketLogs = await AuditLogger.getAuditLogs(testTenant, {
      action: "TICKET_CREATED",
    });

    const authLogs = await AuditLogger.getAuditLogs(testTenant, {
      resourceType: "authentication",
    });

    expect(
      ticketLogs.logs.every((log) => log.action === "TICKET_CREATED")
    ).toBe(true);
    expect(
      authLogs.logs.every((log) => log.resourceType === "authentication")
    ).toBe(true);
  });
});
