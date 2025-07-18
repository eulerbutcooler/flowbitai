#!/bin/bash

# Start the development environment
echo "Starting FlowBit.ai Development Environment"
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/flowbitai
JWT_SECRET=your-secret-key
API_URL=http://api:3000
WEBHOOK_SECRET=flowbit-webhook-secret

# n8n Configuration
N8N_USER_MANAGEMENT_DISABLED=true
N8N_DIAGNOSTICS_ENABLED=false
N8N_VERSION_NOTIFICATIONS_ENABLED=false
N8N_TEMPLATES_ENABLED=false
EOF
fi

# Build and start all services
echo "Building and starting all services..."
docker compose up --build -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 15

# Initialize MongoDB replica set
echo "Initializing MongoDB replica set..."
docker compose exec mongodb mongosh --username admin --password password --authenticationDatabase admin --eval "
  try {
    rs.status();
    print('Replica set already initialized');
  } catch(e) {
    rs.initiate({
      _id: 'rs0',
      members: [{ _id: 0, host: 'mongodb:27017' }]
    });
    print('Replica set initialized');
  }
"

# Wait a bit more for replica set to be ready
sleep 10

# Seed the database
echo "Seeding database with tenant data..."
if [ -f ./seed-db.sh ]; then
    ./seed-db.sh
else
    npm run seed
fi

# Wait for n8n workflow initialization
echo "Waiting for n8n workflow setup..."
sleep 5

# Check if n8n workflow was created successfully
echo "Verifying n8n workflow setup..."
WORKFLOW_CHECK=$(curl -s http://localhost:5678/rest/workflows 2>/dev/null | grep -o '"name":"Ticket Auto-Complete Workflow"' || echo "not found")

if [ "$WORKFLOW_CHECK" != "not found" ]; then
    echo "✅ n8n workflow 'Ticket Auto-Complete Workflow' is active"
else
    echo "⚠️  n8n workflow not found - you may need to check the n8n-init service logs"
fi

echo ""
echo "All services started successfully!"
echo ""
echo "Services available at:"
echo "  - React Shell: http://localhost:3001"
echo "  - Support App: http://localhost:3002"
echo "  - API: http://localhost:3000"
echo "  - n8n: http://localhost:5678"
echo "  - MongoDB: localhost:27017"
echo ""
echo "Demo Credentials:"
echo "  LogisticsCo Admin: admin@logisticsco.com / admin123"
echo "  RetailGmbH Admin: admin@retailgmbh.com / admin123"
echo ""
echo "n8n Workflow Tools:"
echo "  - Check status: ./check-n8n-status.sh"
echo "  - Reset workflow: ./reset-n8n-workflow.sh"
echo ""
echo "Running audit logging demonstration..."
echo "========================================"
sleep 5  # Wait for services to fully start
DATABASE_URL="mongodb://localhost:27017/flowbitai" npx tsx demo-audit.js
echo ""
echo "To view audit logs via API:"
echo "  curl http://localhost:3000/api/audit?tenant=logisticsco"
echo "  curl http://localhost:3000/api/audit?tenant=retailgmbh"
echo ""
echo "To stop all services, run: docker compose down"
echo "To view service logs, run: docker compose logs -f [service-name]"
