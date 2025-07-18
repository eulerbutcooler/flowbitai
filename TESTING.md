# FlowBit.ai E2E Testing Guide

## Cypress Smoke Tests

This project includes comprehensive end-to-end tests using Cypress that verify the complete user workflow:

### Test Scenarios Covered

1. **User Authentication Flow**

   - Login with valid credentials
   - Error handling for invalid credentials
   - Session management

2. **Ticket Management Flow**

   - Create new support tickets
   - Update ticket status
   - View ticket list
   - Handle empty states

3. **Error Handling**
   - Network error scenarios
   - API failure responses
   - Graceful degradation

### Running the Tests

#### Option 1: Full Test Suite (Recommended)

```bash
# Run all E2E tests with automatic service startup
./test-e2e.sh
```

#### Option 2: Smoke Tests Only

```bash
# Run just the smoke tests
./test-e2e.sh --smoke
```

#### Option 3: Headed Mode (for debugging)

```bash
# Run tests with visible browser
./test-e2e.sh --headed
```

#### Option 4: Manual Cypress Testing

```bash
# Start services manually
docker-compose up -d

# Wait for services to be ready
sleep 30

# Run Cypress tests
npm run test:e2e

# Or open Cypress UI
npm run cypress:open
```

### Test Coverage

The smoke test covers the complete user journey:

1. **Login Process**

   - Navigate to application
   - Enter credentials (admin@tenant1.com / password)
   - Verify successful authentication
   - Check dashboard access

2. **🎫 Navigation**

   - Access Support Tickets section
   - Verify module federation loading
   - Check responsive navigation

3. **Ticket Creation**

   - Fill out ticket form
   - Set priority level
   - Submit ticket
   - Verify creation success

4. **Status Updates**

   - Locate created ticket
   - Change status from "open" to "in-progress"
   - Verify status update

5. **Workflow Completion**
   - Confirm all operations completed
   - Verify data persistence
   - Check audit trail

### Test Configuration

#### Test Data

- **Default User**: admin@tenant1.com / password
- **Test Tenant**: tenant1
- **Sample Ticket**: E2E Test Ticket with high priority

#### API Mocking

Tests use Cypress intercepts to mock API responses:

- Authentication endpoints
- Ticket CRUD operations
- Screen configuration
- Error scenarios

#### Browser Support

- Chrome (default)
- Firefox
- Edge

### Debugging Tests

#### View Test Results

```bash
# Check test videos (if enabled)
ls cypress/videos/

# Check screenshots of failures
ls cypress/screenshots/
```

#### Debug Mode

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run specific test file
npx cypress run --spec cypress/e2e/smoke-test.cy.ts
```

#### Service Logs

```bash
# View service logs during test runs
docker-compose logs -f [service-name]

# Available services: react-shell, support-app, api, mongodb, n8n
```

### Test Selectors

Tests use `data-cy` attributes for reliable element selection:

- `data-cy="email-input"` - Login email field
- `data-cy="password-input"` - Login password field
- `data-cy="login-button"` - Login submit button
- `data-cy="app-loaded"` - App ready indicator
- `data-cy="support-tickets-nav"` - Navigation link
- `data-cy="ticket-title-input"` - Ticket title field
- `data-cy="ticket-description-input"` - Ticket description field
- `data-cy="ticket-priority-select"` - Priority selector
- `data-cy="submit-ticket-button"` - Ticket submit button
- `data-cy="status-select"` - Status update dropdown
- `data-cy="error-message"` - Error message display

### Test Reports

After running tests, check:

- Console output for real-time results
- `cypress/videos/` for test recordings
- `cypress/screenshots/` for failure captures
- Service logs for debugging

### Continuous Integration

For CI/CD integration:

```bash
# Headless mode suitable for CI
npm run test:e2e

# With custom configuration
npx cypress run --config baseUrl=http://production-url.com
```

### 🐛 Troubleshooting

#### Common Issues

1. **Services not ready**: Increase wait time in `test-e2e.sh`
2. **Module federation loading**: Check webpack configurations
3. **API connectivity**: Verify Docker networking
4. **Test timeouts**: Adjust timeouts in `cypress.config.js`

#### Quick Fixes

```bash
# Reset everything
docker-compose down
docker-compose up --build -d

# Clear Cypress cache
npx cypress cache clear

# Reinstall dependencies
npm install
```

### Extending Tests

To add new test scenarios:

1. Create new test files in `cypress/e2e/`
2. Use existing patterns and selectors
3. Add new `data-cy` attributes to components
4. Update test scripts in `package.json`

### Success Criteria

A successful test run should show:

- User can login successfully
- Navigation works correctly
- Tickets can be created
- Status updates function properly
- Error handling works

The smoke test validates the core user journey and ensures the application works end-to-end!
