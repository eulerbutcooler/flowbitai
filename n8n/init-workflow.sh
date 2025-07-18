#!/bin/bash

# Wait for n8n to be ready
echo "Waiting for n8n to be ready..."
until curl -f http://n8n:5678/rest/active-workflows > /dev/null 2>&1; do
    sleep 5
    echo "Still waiting for n8n..."
done

echo "n8n is ready! Importing workflow..."

# Create workflow using n8n API
curl -X POST \
  'http://n8n:5678/rest/workflows' \
  -H 'Content-Type: application/json' \
  -d @/workflows/n8n-workflow.json

echo "Workflow import completed!"

# Activate the workflow
echo "Activating workflow..."
curl -X POST \
  'http://n8n:5678/rest/workflows/1/activate' \
  -H 'Content-Type: application/json'

echo "Workflow activated!"
