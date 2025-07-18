# Flowbit AI - Multi-Tenant Workflow Platform

A complete multi-tenant platform demonstrating:

- 🔐 **Tenant-aware authentication & RBAC** with JWT
- ⚛️ **React shell with micro-frontend architecture**
- 🛡️ **Secure API with strict tenant data isolation**
- 🔄 **n8n workflow automation** with automated setup
- 🐳 **Full Docker containerization** with one-command deployment
- 📊 **Comprehensive audit logging** system
- 🧪 **Complete test suite** with tenant isolation verification

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Shell   │    │   Support App   │    │      n8n        │
│   (Port 3001)   │◄──►│   (Port 3002)   │    │   (Port 5678)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │   API Server    │
                    │   (Port 3000)   │
                    └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    MongoDB      │
                    │ Replica Set     │
                    │   (Port 27017)  │
                    └─────────────────┘
```

## ✨ Key Features

**🔐 Authentication & Authorization**

- JWT-based multi-tenant authentication
- Role-based access control (ADMIN/USER)
- Tenant isolation at data and API level

**⚛️ Micro-Frontend Architecture**

- React shell with Webpack Module Federation
- Dynamic loading of tenant-specific applications
- Isolated development and deployment

**🔄 Workflow Automation**

- **Automated n8n setup** - No manual configuration needed!
- Ticket auto-completion workflows
- Webhook-based integrations with round-trip callbacks

**📊 Audit & Monitoring**

- Comprehensive audit logging system
- Tenant-aware audit trails
- API endpoints for audit data retrieval

**🐳 DevOps Ready**

- Complete Docker containerization
- MongoDB replica set with transaction support
- Automated database seeding
- CI/CD ready with GitHub Actions

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)

### 🚀 One-Command Setup

```bash
./start.sh
```

This script automatically:

1. ✅ **Checks dependencies** and creates environment
2. ✅ **Starts all services** via Docker Compose
3. ✅ **Initializes MongoDB replica set** for transactions
4. ✅ **Creates n8n workflows** automatically (no UI needed!)
5. ✅ **Seeds database** with demo tenants and users
6. ✅ **Verifies service health** and shows access URLs
7. ✅ **Runs audit logging demo** to show functionality

```bash
./start.sh
```

This script will:

1. Check dependencies
2. Create `.env` from `.env.example`
3. Start all services via Docker Compose
4. Verify service health
5. Show access URLs and demo credentials

### Manual Setup

```bash
# 1. Environment setup
cp .env.example .env

# 2. Start all services
docker-compose up --build

# 3. Access the application
# React Shell: http://localhost:3001
# API: http://localhost:3000
# n8n: http://localhost:5678
```

## 📋 Demo Credentials

| User Type | Email                 | Password | Tenant      | Access      |
| --------- | --------------------- | -------- | ----------- | ----------- |
| Admin     | admin@logisticsco.com | admin123 | LogisticsCo | Full access |
| Admin     | admin@retailgmbh.com  | admin123 | RetailGmbH  | Full access |

## 🔧 Service Details

### React Shell (Port 3001)

- Main application entry point with tenant-aware navigation
- Fetches screens from `/api/me/screens` based on user's tenant
- Dynamically loads micro-frontends via Webpack Module Federation
- Responsive design with tenant branding

### Support App (Port 3002)

- Micro-frontend for support ticket management
- Exposed via Module Federation as `supportApp/SupportTicketsApp`
- Demonstrates tenant isolation with automatic n8n workflow triggers
- Real-time ticket status updates

### API Server (Port 3000)

- **Express.js with TypeScript** and comprehensive error handling
- **JWT-based authentication** with tenant and role validation
- **MongoDB with Prisma ORM** for type-safe database operations
- **Webhook endpoints** for n8n integration with signature verification
- **Audit logging system** for compliance and monitoring
- **RESTful endpoints** for all CRUD operations

#### Key API Endpoints:

```
POST   /api/auth/login          # Authentication
GET    /api/me/screens          # Tenant-specific navigation
GET    /api/tickets             # Tenant-isolated tickets
POST   /api/tickets             # Create ticket (triggers n8n)
PATCH  /api/tickets/:id/status  # Manual status updates
GET    /api/audit               # Audit logs (tenant-isolated)
POST   /webhook/ticket-done     # n8n callback endpoint
```

### n8n Workflow Engine (Port 5678)

- **Automated workflow setup** - No manual configuration required!
- **"Ticket Auto-Complete Workflow"** created automatically
- Webhook endpoint: `http://localhost:5678/webhook/ticket-created`
- **Visual workflow editor** available in browser
- **Shared secret authentication** for security

#### Workflow Tools:

```bash
./check-n8n-status.sh      # Check workflow status
./reset-n8n-workflow.sh    # Reset/recreate workflow
```

### MongoDB (Port 27017)

- **Replica set configuration** for transaction support
- **Tenant isolation** via `customerId` field in all collections
- **Automatic indexing** for performance
- **Transaction support** for data consistency

## 🚀 Development

### Local Development (Hybrid)

```bash
# Option 1: Full Docker (Recommended)
./start.sh

# Option 2: API only in Docker, frontend local
docker compose up -d mongodb api n8n
cd react-shell && npm install && npm start
cd support-app && npm install && npm start
```

### Testing

```bash
# Run all tests
npm test

# Specific test suites
npm test -- tenant-isolation        # Tenant data isolation
npm test -- screens-integration     # Dynamic navigation
npm test -- webhook-integration     # n8n workflow testing
npm test -- audit-integration       # Audit logging

# Coverage report
npm test -- --coverage
```

### Code Quality

```bash
# Lint all code (zero warnings enforced)
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Lint specific areas
npm run lint:api           # API TypeScript code
npm run lint:react-shell   # React shell
npm run lint:support-app   # Support micro-frontend
```

## 🐳 Docker Deployment

The entire system runs seamlessly in Docker with automated initialization:

```bash
# Complete deployment with automated n8n setup
./start.sh
```

### Docker Services:

- **mongodb**: Replica set with transaction support
- **api**: Express.js API server with Prisma ORM
- **react-shell**: Main React application
- **support-app**: Support micro-frontend
- **n8n**: Workflow automation engine
- **n8n-init**: Automated workflow setup service

All services include health checks and dependency management for reliable startup.

## 🔍 Monitoring & Debugging

### Health Checks

```bash
# Check all service status
docker compose ps

# Check n8n workflow status
./check-n8n-status.sh

# View service logs
docker compose logs api
docker compose logs n8n
```

### Database Tools

```bash
# Seed database with demo data
./seed-db.sh

# Reset system state
docker compose down -v  # Removes volumes
./start.sh              # Fresh start
```

### Development Tools

```bash
# Watch mode for API changes
docker compose up api --build

# Hot reload for frontend (development mode)
cd react-shell && npm run dev
cd support-app && npm run dev
```

## 📊 Audit & Compliance

The system includes comprehensive audit logging:

- **User actions**: Login, screen access, data operations
- **System events**: Workflow triggers, webhook calls
- **Data changes**: Create, update, delete operations
- **Security events**: Authentication failures, unauthorized access

Access audit logs via API: `GET /api/audit` (tenant-isolated)

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Tenant Isolation**: Complete data separation between tenants
- **Webhook Verification**: Shared secret validation for n8n callbacks
- **Role-based Access**: Extensible permission system
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API protection against abuse

## 🚀 Quick Setup Commands

To get started immediately:

```bash
# Clone and setup
git clone <repository-url>
cd flowbitai
./start.sh
```

Then open http://localhost:3001 and login with:

- admin@logisticsco.com / admin123 (LogisticsCo Admin)
- admin@retailgmbh.com / admin123 (RetailGmbH Admin)

The system demonstrates:

1. **Tenant isolation** - Each user only sees their own data
2. **Dynamic navigation** - Different tenants see different screens
3. **Micro-frontend loading** - Support app loads remotely via Module Federation
4. **Workflow integration** - Creating tickets triggers n8n workflows

## 🔧 Troubleshooting

If you encounter issues:

1. **Port conflicts**: Update ports in `docker-compose.yml`
2. **Docker issues**: Ensure Docker is running and has sufficient resources
3. **Module Federation errors**: Check browser console for CORS/loading issues
4. **Database connection**: Verify MongoDB container is healthy
5. **n8n workflow**: Use `./check-n8n-status.sh` to verify automation setup

For detailed logs: `docker compose logs -f [service-name]`

## 📚 Additional Resources

- **n8n Automation Guide**: See `N8N_AUTOMATION.md` for workflow details
- **Testing Guide**: See `TESTING.md` for comprehensive test documentation
- **CI/CD Pipeline**: GitHub Actions with automated testing and linting
