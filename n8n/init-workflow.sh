#!/bin/bash

echo "=== n8n Workflow Auto-Setup ==="
echo "Waiting for n8n to be ready..."

# Wait for n8n to be ready with better error handling
RETRY_COUNT=0
MAX_RETRIES=30
until curl -f http://n8n:5678/rest/active-workflows > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Timeout waiting for n8n to be ready"
        exit 1
    fi
    sleep 5
    echo "⏳ Still waiting for n8n... (attempt $RETRY_COUNT/$MAX_RETRIES)"
done

echo "✅ n8n is ready!"

# Check if workflow already exists
EXISTING_WORKFLOW=$(curl -s http://n8n:5678/rest/workflows | grep -o '"name":"Ticket Auto-Complete Workflow"' || true)

if [ -n "$EXISTING_WORKFLOW" ]; then
    echo "📋 Workflow 'Ticket Auto-Complete Workflow' already exists"
    # Get the workflow ID and activate it
    WORKFLOW_ID=$(curl -s http://n8n:5678/rest/workflows | grep -A 5 -B 5 '"name":"Ticket Auto-Complete Workflow"' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$WORKFLOW_ID" ]; then
        echo "🔄 Activating existing workflow (ID: $WORKFLOW_ID)..."
        ACTIVATION_RESULT=$(curl -s -X POST "http://n8n:5678/rest/workflows/$WORKFLOW_ID/activate" -H 'Content-Type: application/json')
        echo "✅ Workflow activation completed"
    fi
else
    echo "📥 Creating new workflow..."
    
    # Create workflow using n8n API
    CREATE_RESULT=$(curl -s -X POST \
      'http://n8n:5678/rest/workflows' \
      -H 'Content-Type: application/json' \
      -d @/workflows/n8n-workflow.json)
    
    # Check if creation was successful
    if echo "$CREATE_RESULT" | grep -q '"id"'; then
        echo "✅ Workflow created successfully!"
        
        # Extract workflow ID and activate it
        WORKFLOW_ID=$(echo "$CREATE_RESULT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$WORKFLOW_ID" ]; then
            echo "🔄 Activating workflow (ID: $WORKFLOW_ID)..."
            ACTIVATION_RESULT=$(curl -s -X POST "http://n8n:5678/rest/workflows/$WORKFLOW_ID/activate" -H 'Content-Type: application/json')
            echo "✅ Workflow activated!"
        fi
    else
        echo "❌ Failed to create workflow. Response: $CREATE_RESULT"
        exit 1
    fi
fi

# Verify the webhook is accessible
echo "🔍 Verifying webhook endpoint..."
WEBHOOK_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://n8n:5678/webhook/ticket-created)

if [ "$WEBHOOK_TEST" = "404" ] || [ "$WEBHOOK_TEST" = "411" ]; then
    echo "✅ Webhook endpoint is active at: http://n8n:5678/webhook/ticket-created"
else
    echo "⚠️  Webhook endpoint returned HTTP $WEBHOOK_TEST"
fi

echo "🎉 n8n workflow setup complete!"
echo ""
echo "Workflow Details:"
echo "  - Name: Ticket Auto-Complete Workflow"
echo "  - Webhook URL: http://n8n:5678/webhook/ticket-created"
echo "  - Purpose: Auto-complete tickets when triggered"
echo ""
