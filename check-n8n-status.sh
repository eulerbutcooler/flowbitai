#!/bin/bash

echo "=== n8n Workflow Status Check ==="
echo ""

# Check if n8n is running
if ! curl -f http://localhost:5678/rest/active-workflows > /dev/null 2>&1; then
    echo "❌ n8n is not accessible at http://localhost:5678"
    echo "   Make sure n8n service is running: docker compose ps n8n"
    exit 1
fi

echo "✅ n8n is running at http://localhost:5678"
echo ""

# Get all workflows
echo "📋 Checking workflows..."
WORKFLOWS=$(curl -s http://localhost:5678/rest/workflows)

if echo "$WORKFLOWS" | grep -q '"name":"Ticket Auto-Complete Workflow"'; then
    WORKFLOW_ID=$(echo "$WORKFLOWS" | grep -A 5 -B 5 '"name":"Ticket Auto-Complete Workflow"' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    IS_ACTIVE=$(echo "$WORKFLOWS" | grep -A 10 -B 10 '"name":"Ticket Auto-Complete Workflow"' | grep -o '"active":[^,]*' | cut -d':' -f2)
    
    echo "'Ticket Auto-Complete Workflow' found"
    echo " ID: $WORKFLOW_ID"
    echo "Active: $IS_ACTIVE"
    
    if [ "$IS_ACTIVE" = "true" ]; then
        echo "   ✅ Workflow is ACTIVE"
    else
        echo "   ⚠️  Workflow is INACTIVE"
    fi
else
    echo "'Ticket Auto-Complete Workflow' not found"
    echo "   Run ./reset-n8n-workflow.sh to create it"
fi

echo ""

# Test webhook endpoint
echo "Testing webhook endpoint..."
WEBHOOK_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5678/webhook/ticket-created)

case "$WEBHOOK_TEST" in
    "404"|"411")
        echo "Webhook endpoint is active (HTTP $WEBHOOK_TEST)"
        echo "URL: http://localhost:5678/webhook/ticket-created"
        ;;
    "000")
        echo "Cannot reach webhook endpoint (connection failed)"
        ;;
    *)
        echo "Webhook endpoint returned HTTP $WEBHOOK_TEST"
        ;;
esac

echo ""

# Get active workflows count
ACTIVE_COUNT=$(curl -s http://localhost:5678/rest/active-workflows | grep -o '"[^"]*"' | wc -l)
echo "Summary:"
echo "   - Total active workflows: $((ACTIVE_COUNT / 2))"
echo "   - n8n Web UI: http://localhost:5678"
echo "   - API Documentation: http://localhost:5678/rest"
echo ""

if echo "$WORKFLOWS" | grep -q '"name":"Ticket Auto-Complete Workflow"' && [ "$IS_ACTIVE" = "true" ]; then
    echo "n8n workflow is properly configured and active!"
    echo ""
    echo "Test the workflow:"
    echo "   1. Create a ticket via API or UI"
    echo "   2. Check if ticket status automatically changes to 'complete'"
    echo "   3. View logs: docker compose logs n8n"
else
    echo "Workflow needs attention. Run ./reset-n8n-workflow.sh to fix."
fi
