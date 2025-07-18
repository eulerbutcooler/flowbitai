// cypress/support/index.d.ts
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<Element>;
    createTicket(
      title: string,
      description: string,
      priority?: string
    ): Chainable<Element>;
    updateTicketStatus(ticketId: string, status: string): Chainable<Element>;
    waitForApp(): Chainable<Element>;
  }
}
