#!/bin/bash

# Start the development environment
echo "Starting FlowBit.ai Development Environment"
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start all services
echo "Building and starting all services..."
docker-compose up --build -d

echo "All services started successfully!"
echo ""
echo "🌐 Services available at:"
echo "  - React Shell: http://localhost:3000"
echo "  - Support App: http://localhost:3001"
echo "  - API: http://localhost:3002"
echo "  - n8n: http://localhost:5678"
echo "  - MongoDB: localhost:27017"
echo ""
echo "� Running audit logging demonstration..."
echo "========================================"
sleep 5  # Wait for services to fully start
node demo-audit.js
echo ""
echo "� To view audit logs via API:"
echo "  curl http://localhost:3002/api/audit?tenant=demo-tenant"
echo ""
echo "To stop all services, run: docker-compose down"
echo "To view service logs, run: docker-compose logs -f [service-name]"