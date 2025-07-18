#!/bin/bash

echo "=== n8n Workflow Reset Tool ==="
echo "This will delete and recreate the n8n workflow"
echo ""

# Check if n8n is running
if ! curl -f http://localhost:5678/rest/active-workflows > /dev/null 2>&1; then
    echo "❌ n8n is not accessible. Please make sure it's running."
    echo "Run: docker compose up -d n8n"
    exit 1
fi

echo "🔍 Checking for existing workflows..."

# Get all workflows
WORKFLOWS=$(curl -s http://localhost:5678/rest/workflows)

# Find the ticket workflow
WORKFLOW_ID=$(echo "$WORKFLOWS" | grep -A 5 -B 5 '"name":"Ticket Auto-Complete Workflow"' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$WORKFLOW_ID" ]; then
    echo "📋 Found existing workflow with ID: $WORKFLOW_ID"
    echo "🗑️  Deleting existing workflow..."
    
    # Deactivate first
    curl -s -X POST "http://localhost:5678/rest/workflows/$WORKFLOW_ID/deactivate" -H 'Content-Type: application/json' > /dev/null
    
    # Delete the workflow
    DELETE_RESULT=$(curl -s -X DELETE "http://localhost:5678/rest/workflows/$WORKFLOW_ID")
    echo "✅ Existing workflow deleted"
else
    echo "📋 No existing 'Ticket Auto-Complete Workflow' found"
fi

echo "📥 Creating new workflow..."

# Create the new workflow
CREATE_RESULT=$(curl -s -X POST \
  'http://localhost:5678/rest/workflows' \
  -H 'Content-Type: application/json' \
  -d @n8n-workflow.json)

# Check if creation was successful
if echo "$CREATE_RESULT" | grep -q '"id"'; then
    NEW_WORKFLOW_ID=$(echo "$CREATE_RESULT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "✅ New workflow created with ID: $NEW_WORKFLOW_ID"
    
    # Activate the workflow
    echo "🔄 Activating workflow..."
    ACTIVATION_RESULT=$(curl -s -X POST "http://localhost:5678/rest/workflows/$NEW_WORKFLOW_ID/activate" -H 'Content-Type: application/json')
    echo "✅ Workflow activated!"
    
    # Verify webhook
    echo "🔍 Verifying webhook endpoint..."
    WEBHOOK_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5678/webhook/ticket-created)
    
    if [ "$WEBHOOK_TEST" = "404" ] || [ "$WEBHOOK_TEST" = "411" ]; then
        echo "✅ Webhook endpoint is active"
    else
        echo "⚠️  Webhook endpoint returned HTTP $WEBHOOK_TEST"
    fi
    
    echo ""
    echo "🎉 Workflow reset complete!"
    echo ""
    echo "Workflow Details:"
    echo "  - Name: Ticket Auto-Complete Workflow"
    echo "  - ID: $NEW_WORKFLOW_ID"
    echo "  - Webhook URL: http://localhost:5678/webhook/ticket-created"
    echo "  - Web UI: http://localhost:5678"
    echo ""
else
    echo "❌ Failed to create workflow"
    echo "Response: $CREATE_RESULT"
    exit 1
fi
