// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

// Custom command for login
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/");
  cy.get("[data-cy=email-input]").type(email);
  cy.get("[data-cy=password-input]").type(password);
  cy.get("[data-cy=login-button]").click();
  cy.wait("@login");
  cy.url().should("include", "/dashboard");
});

// Custom command for creating a ticket
Cypress.Commands.add(
  "createTicket",
  (title, description, priority = "medium") => {
    cy.get("[data-cy=new-ticket-button]").click();
    cy.get("[data-cy=ticket-title-input]").type(title);
    cy.get("[data-cy=ticket-description-input]").type(description);
    cy.get("[data-cy=ticket-priority-select]").select(priority);
    cy.get("[data-cy=submit-ticket-button]").click();
    cy.wait("@createTicket");
  }
);

// Custom command for updating ticket status
Cypress.Commands.add("updateTicketStatus", (ticketId, status) => {
  cy.get(`[data-cy=ticket-${ticketId}]`).click();
  cy.get("[data-cy=status-select]").select(status);
  cy.get("[data-cy=update-status-button]").click();
  cy.wait("@updateTicket");
});

// Custom command to wait for app to load
Cypress.Commands.add("waitForApp", () => {
  cy.get("[data-cy=app-loaded]", { timeout: 30000 }).should("be.visible");
});
