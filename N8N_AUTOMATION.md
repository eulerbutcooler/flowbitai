# n8n Workflow Automation

This project includes automated n8n workflow setup that eliminates the need to manually configure workflows through the UI.

## How It Works

When you run `./start.sh`, the system automatically:

1. ✅ **Starts n8n service** in Docker
2. ✅ **Waits for n8n to be ready** (up to 2.5 minutes)
3. ✅ **Checks for existing workflows** to avoid duplicates
4. ✅ **Creates the "Ticket Auto-Complete Workflow"** from JSON
5. ✅ **Activates the workflow** automatically
6. ✅ **Verifies the webhook endpoint** is accessible

## Workflow Details

**Name**: Ticket Auto-Complete Workflow  
**Purpose**: Automatically marks tickets as "complete" when triggered  
**Webhook URL**: `http://localhost:5678/webhook/ticket-created`

### Workflow Steps:

1. **Webhook Trigger** - Receives ticket creation events
2. **HTTP Request** - Calls back to API to update ticket status
3. **Response** - Returns success confirmation

## Files Involved

```
├── n8n-workflow.json           # Workflow definition (exported from n8n UI)
├── n8n/
│   └── init-workflow.sh        # Auto-setup script
├── start.sh                    # Main startup script (includes n8n setup)
├── check-n8n-status.sh        # Status verification tool
├── reset-n8n-workflow.sh      # Reset/recreate workflow tool
└── docker-compose.yml         # Includes n8n and n8n-init services
```

## Usage

### Normal Startup (Automatic)

```bash
./start.sh
```

The workflow is created automatically - no manual setup needed!

### Manual Tools

#### Check Workflow Status

```bash
./check-n8n-status.sh
```

Shows:

- ✅ n8n service status
- 📋 Workflow existence and state
- 🔄 Active/inactive status
- 🌐 Webhook endpoint health

#### Reset/Recreate Workflow

```bash
./reset-n8n-workflow.sh
```

Useful when:

- Workflow gets corrupted
- You want to update workflow definition
- Manual recreation is needed

### Testing the Workflow

1. **Create a ticket** (via API or React app):

   ```bash
   curl -X POST http://localhost:3000/api/tickets \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","description":"Auto-complete test"}'
   ```

2. **Check ticket status** - should automatically become "complete"

   ```bash
   curl http://localhost:3000/api/tickets \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **View n8n logs** to see execution:
   ```bash
   docker compose logs -f n8n
   ```

## Troubleshooting

### Workflow Not Created

```bash
# Check n8n service
docker compose ps n8n

# Check init logs
docker compose logs n8n-init

# Manually reset
./reset-n8n-workflow.sh
```

### Webhook Not Working

```bash
# Verify endpoint
curl -I http://localhost:5678/webhook/ticket-created

# Check workflow status
./check-n8n-status.sh

# View n8n execution logs
docker compose logs -f n8n
```

### Environment Issues

Ensure these are set in `.env`:

```env
API_URL=http://api:3000
WEBHOOK_SECRET=flowbit-webhook-secret
N8N_USER_MANAGEMENT_DISABLED=true
```

## Manual Workflow Creation (Alternative)

If you prefer to create workflows manually:

1. Open n8n UI: http://localhost:5678
2. Import `n8n-workflow.json` via UI
3. Activate the workflow
4. Test webhook endpoint

## Benefits of Automated Setup

- 🚀 **Zero Manual Configuration** - Works out of the box
- 🔄 **Repeatable** - Same setup every time
- 🧪 **Development Friendly** - Easy to reset and test
- 📋 **Version Controlled** - Workflow definition in git
- 🛠️ **Troubleshooting Tools** - Built-in status and reset scripts

## Workflow JSON Structure

The `n8n-workflow.json` contains:

- **Webhook Node**: Listens for POST to `/webhook/ticket-created`
- **HTTP Request Node**: Calls API to update ticket status
- **Response Node**: Returns confirmation to caller

This JSON can be:

- ✅ Modified and version controlled
- ✅ Exported/imported between environments
- ✅ Shared with team members
- ✅ Automatically deployed via CI/CD
