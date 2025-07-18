# Flowbit AI - Multi-Tenant Workflow Platform

A complete multi-tenant platform demonstrating:

- Tenant-aware authentication & RBAC
- React shell that dynamically loads micro-frontends
- Secure API with strict tenant data isolation
- n8n workflow integration with round-trip callbacks
- Full Docker containerization

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
                    │   (Port 27017)  │
                    └─────────────────┘
```

## Core Requirements Implemented

**R1 - Auth & RBAC**: JWT-based authentication with customerId and role-based access  
**R2 - Tenant Data Isolation**: All MongoDB collections include customerId with Jest tests  
**R3 - Use-Case Registry**: Hard-coded tenant/screen mappings in `registry.json`  
**R4 - Dynamic Navigation**: React shell fetches `/me/screens` and loads micro-frontends  
**R5 - Workflow Ping**: n8n integration with webhook callbacks  
**R6 - Containerized Dev**: Complete Docker Compose setup with self-configuration

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)

### One-Command Setup

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

## Demo Credentials

| User Type | Email                 | Password | Tenant      | Access      |
| --------- | --------------------- | -------- | ----------- | ----------- |
| Admin     | admin@logisticsco.com | admin123 | LogisticsCo | Full access |
| Admin     | admin@retailgmbh.com  | admin123 | RetailGmbH  | Full access |

## Service Details

### React Shell (Port 3001)

- Main application entry point
- Fetches tenant screens from `/api/me/screens`
- Dynamically loads micro-frontends via Webpack Module Federation
- Tenant-aware navigation sidebar

### Support App (Port 3002)

- Micro-frontend for support ticket management
- Exposed via Module Federation as `supportApp/SupportTicketsApp`
- Demonstrates tenant isolation in ticket creation/viewing

### API Server (Port 3000)

- Express.js with TypeScript
- JWT-based authentication middleware
- MongoDB with Prisma ORM
- Webhook endpoints for n8n integration

### n8n Workflow Engine (Port 5678)

- No-code workflow automation
- Receives triggers from ticket creation
- Calls back to API via webhooks
- Shared secret verification

### MongoDB (Port 27017)

- Primary data store
- All collections include `customerId` for tenant isolation
- Mongo Express available on port 8081

## Development

### Local Development (without Docker)

```bash
# Terminal 1 - API
npm install
npm run dev

# Terminal 2 - React Shell
cd react-shell
npm install
npm start

# Terminal 3 - Support App
cd support-app
npm install
npm start

# Terminal 4 - MongoDB (via Docker)
docker run -p 27017:27017 mongo:7
```

### Testing

```bash
# Run Jest tests
npm test

# Run specific test suites
npm test -- tenant-isolation
npm test -- screens-integration
npm test -- webhook-integration
```

## Quick Setup Commands

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

## Troubleshooting

If you encounter issues:

1. **Port conflicts**: Update ports in docker-compose.yml
2. **Docker issues**: Ensure Docker is running and has sufficient resources
3. **Module Federation errors**: Check browser console for CORS/loading issues
4. **Database connection**: Verify MongoDB container is healthy

For detailed logs: `docker-compose logs -f [service-name]`
