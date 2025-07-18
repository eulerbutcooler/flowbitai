/// <reference types="cypress" />

describe("FlowBit.ai Smoke Test - Login → Create Ticket → Status Updates", () => {
  const testUser = {
    email: "admin@logisticsco.com",
    password: "admin123",
    tenant: "logisticsco",
  };

  const testTicket = {
    title: "E2E Test Ticket",
    description: "This is a test ticket created by Cypress automation",
    priority: "high",
  };

  beforeEach(() => {
    // Handle uncaught exceptions from cross-origin scripts (Module Federation)
    cy.on("uncaught:exception", (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      if (
        err.message.includes("Script error") ||
        err.message.includes("cross-origin")
      ) {
        return false;
      }
      return true;
    });

    // Set up API intercepts for mocking backend responses
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: "mock-jwt-token-12345",
          user: {
            id: "test-user-123",
            email: testUser.email,
            tenant: testUser.tenant,
            role: "admin",
          },
        },
      },
    }).as("login");

    cy.intercept("GET", "**/api/me/screens", {
      statusCode: 200,
      body: {
        success: true,
        data: {
          screens: [
            {
              id: "support-tickets",
              name: "Support Tickets",
              url: "http://localhost:3002/remoteEntry.js",
              scope: "supportApp",
              module: "./SupportTicketsApp",
              route: "/tickets",
              active: true,
            },
          ],
          tenant: testUser.tenant,
          tenantName: "Test Tenant 1",
        },
      },
    }).as("getScreens");

    cy.intercept("GET", "**/api/tickets*", {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: "test-ticket-123",
            title: testTicket.title,
            description: testTicket.description,
            priority: testTicket.priority,
            status: "pending",
            customerId: testUser.tenant,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    }).as("getTickets");

    cy.intercept("POST", "**/api/tickets", {
      statusCode: 200,
      body: {
        message: "Ticket created",
        ticket: {
          id: "test-ticket-123",
          title: testTicket.title,
          description: testTicket.description,
          priority: testTicket.priority,
          status: "pending",
          customerId: testUser.tenant,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    }).as("createTicket");

    cy.intercept("PUT", "**/api/tickets/*", {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: "test-ticket-123",
          title: testTicket.title,
          description: testTicket.description,
          priority: testTicket.priority,
          status: "in-progress",
          customerId: "test-user-123",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    }).as("updateTicket");

    // Set up viewport for consistent testing
    cy.viewport(1280, 720);
  });

  it("should complete the full user workflow: login → create ticket → update status", () => {
    // Step 1: Visit application and login
    cy.log("Step 1: User Login");
    cy.visit("/");

    // Wait for page to load
    cy.get("body").should("contain", "Flowbit AI");

    // Login with test credentials
    cy.get("[data-cy=email-input]").should("be.visible").type(testUser.email);
    cy.get("[data-cy=password-input]")
      .should("be.visible")
      .type(testUser.password);
    cy.get("[data-cy=login-button]").should("be.visible").click();

    // Wait for login to complete
    cy.wait("@login");
    cy.wait("@getScreens");

    // Verify successful login - should see dashboard
    cy.get("[data-cy=app-loaded]").should("be.visible");
    cy.get("body").should("contain", "Dashboard");

    // Step 2: Navigate to Support Tickets
    cy.log("🎫 Step 2: Navigate to Support Tickets");
    cy.get("[data-cy=support-tickets-nav]").should("be.visible").click();

    // Wait for navigation and module loading
    cy.wait("@getTickets");
    cy.get("body").should("contain", "Support Tickets");

    // Wait for the support tickets module to fully load
    cy.get("[data-cy=new-ticket-button]", { timeout: 15000 }).should(
      "be.visible"
    );

    // Step 3: Create a new ticket
    cy.log("Step 3: Create New Ticket");

    // Click the new ticket button to show the form (if needed)
    cy.get("[data-cy=new-ticket-button]").click();

    // Fill out the ticket form
    cy.get("[data-cy=ticket-title-input]")
      .should("be.visible")
      .type(testTicket.title);
    cy.get("[data-cy=ticket-description-input]")
      .should("be.visible")
      .type(testTicket.description);
    cy.get("[data-cy=ticket-priority-select]")
      .should("be.visible")
      .select(testTicket.priority);

    // Submit the ticket
    cy.get("[data-cy=submit-ticket-button]").should("be.visible").click();

    // Wait for ticket creation
    cy.wait("@createTicket");

    // Verify ticket was created and appears in the list
    cy.get("body").should("contain", testTicket.title);
    cy.get("body").should("contain", testTicket.description);
    cy.get("body").should("contain", "pending");

    // Step 4: Update ticket status
    cy.log("Step 4: Update Ticket Status");

    // Find the ticket and update its status
    cy.get("[data-cy=ticket-test-ticket-123]").should("be.visible");
    cy.get("[data-cy=status-select]")
      .should("be.visible")
      .select("in-progress");

    // Wait for status update
    cy.wait("@updateTicket");

    // Verify status was updated
    cy.get("body").should("contain", "in-progress");

    // Step 5: Verify the workflow completed successfully
    cy.log("Step 5: Verify Workflow Completion");

    // Verify we're still authenticated and in the application
    cy.get("[data-cy=app-loaded]").should("be.visible");
    cy.get("body").should("contain", "Support Tickets");
    cy.get("body").should("contain", testTicket.title);
    cy.get("body").should("contain", "in-progress");

    // Verify the ticket count is updated
    cy.get("body").should("contain", "Your Tickets (1)");
  });

  it("should handle login errors gracefully", () => {
    cy.log("🚨 Testing Login Error Handling");

    // Mock failed login
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 401,
      body: {
        success: false,
        error: "Invalid credentials",
      },
    }).as("failedLogin");

    cy.visit("/");

    // Attempt login with invalid credentials
    cy.get("[data-cy=email-input]")
      .should("be.visible")
      .type("invalid@example.com");
    cy.get("[data-cy=password-input]")
      .should("be.visible")
      .type("wrongpassword");
    cy.get("[data-cy=login-button]").should("be.visible").click();

    cy.wait("@failedLogin");

    // Verify error message is displayed
    cy.get("[data-cy=error-message]")
      .should("be.visible")
      .should("contain", "Invalid credentials");

    // Verify user remains on login page
    cy.get("body").should("contain", "Flowbit AI Login");
    cy.get("[data-cy=app-loaded]").should("not.exist");
  });

  it("should handle empty ticket list gracefully", () => {
    cy.log("Testing Empty Ticket List");

    // Login first
    cy.visit("/");
    cy.get("[data-cy=email-input]").type(testUser.email);
    cy.get("[data-cy=password-input]").type(testUser.password);
    cy.get("[data-cy=login-button]").click();

    cy.wait("@login");
    cy.wait("@getScreens");

    // Navigate to support tickets
    cy.get("[data-cy=support-tickets-nav]").click();
    cy.wait("@getTickets");

    // Verify empty state message
    cy.get("body").should("contain", "No tickets found");
    cy.get("body").should("contain", "Create your first ticket above!");
    cy.get("body").should("contain", "Your Tickets (0)");
  });

  it("should handle network errors gracefully", () => {
    cy.log("🌐 Testing Network Error Handling");

    // Mock network error for login
    cy.intercept("POST", "**/api/auth/login", {
      forceNetworkError: true,
    }).as("networkError");

    cy.visit("/");

    // Attempt login
    cy.get("[data-cy=email-input]").type(testUser.email);
    cy.get("[data-cy=password-input]").type(testUser.password);
    cy.get("[data-cy=login-button]").click();

    cy.wait("@networkError");

    // Verify error handling
    cy.get("[data-cy=error-message]").should("be.visible");
    cy.get("body").should("contain", "Invalid credentials");
  });
});
