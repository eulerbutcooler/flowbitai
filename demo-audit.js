#!/usr/bin/env node

// Demo script to show audit logging in action
import { PrismaClient } from "@prisma/client";
import { AuditLogger } from "./api/models/AuditLog.ts";

const prisma = new PrismaClient();

async function demonstrateAuditLogging() {
  console.log("🔍 Demonstrating Audit Logging System");
  console.log("=====================================\n");

  const testTenant = "demo-tenant";
  const testUserId = "demo-user-123";

  try {
    // Simulate user login
    console.log("1. Logging user login...");
    await AuditLogger.log({
      action: "USER_LOGIN",
      userId: testUserId,
      tenant: testTenant,
      resourceType: "authentication",
      resourceId: "auth-session-456",
      details: {
        loginMethod: "username_password",
        success: true,
      },
      ipAddress: "192.168.1.100",
      userAgent: "Demo Browser 1.0",
    });

    // Simulate ticket creation
    console.log("2. Logging ticket creation...");
    await AuditLogger.log({
      action: "TICKET_CREATED",
      userId: testUserId,
      tenant: testTenant,
      resourceType: "ticket",
      resourceId: "ticket-789",
      details: {
        title: "Demo Support Ticket",
        description: "This is a demo ticket for audit logging",
        priority: "medium",
        status: "pending",
      },
      ipAddress: "192.168.1.100",
      userAgent: "Demo Browser 1.0",
    });

    // Simulate ticket update
    console.log("3. Logging ticket update...");
    await AuditLogger.log({
      action: "TICKET_UPDATED",
      userId: testUserId,
      tenant: testTenant,
      resourceType: "ticket",
      resourceId: "ticket-789",
      details: {
        changes: {
          status: { from: "pending", to: "in_progress" },
          assignee: { from: null, to: "support-agent-1" },
        },
      },
      ipAddress: "192.168.1.100",
      userAgent: "Demo Browser 1.0",
    });

    // Retrieve and display audit logs
    console.log("\n4. Retrieving audit logs...");
    const result = await AuditLogger.getAuditLogs(testTenant, {
      page: 1,
      limit: 10,
    });

    console.log(`\nFound ${result.total} audit log entries:`);
    console.log("==========================================");

    result.logs.forEach((log, index) => {
      console.log(`\n${index + 1}. Action: ${log.action}`);
      console.log(`   User: ${log.userId}`);
      console.log(`   Resource: ${log.resourceType}:${log.resourceId}`);
      console.log(`   Timestamp: ${log.timestamp}`);
      console.log(`   IP: ${log.ipAddress}`);
      if (log.details) {
        console.log(`   Details: ${JSON.stringify(log.details, null, 2)}`);
      }
    });

    // Demonstrate filtering
    console.log("\n5. Filtering by action (TICKET_*)...");
    const ticketLogs = await AuditLogger.getAuditLogs(testTenant, {
      action: "TICKET_CREATED",
    });

    console.log(`\nFound ${ticketLogs.total} ticket creation logs:`);
    ticketLogs.logs.forEach((log, index) => {
      console.log(
        `   ${index + 1}. ${log.action} - ${log.resourceId} at ${log.timestamp}`
      );
    });

    console.log("\nAudit logging demonstration completed successfully!");
    console.log("\nKey features demonstrated:");
    console.log("- Multi-tenant isolation");
    console.log("- Comprehensive event logging");
    console.log("- Structured details storage");
    console.log("- Filtering and pagination");
    console.log("- IP and user agent tracking");
  } catch (error) {
    console.error("Error during audit logging demonstration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the demonstration
demonstrateAuditLogging().catch(console.error);
