# MCP Jarvis Server - Project Documentation

## Overview

A self-hosted MCP (Model Context Protocol) server that enables AI agents like claude to manage todos, shopping lists, and reminders. Designed for users to run on their own home servers with configurable storage backends and OAuth2 authentication.

## Architecture

### System Components

```
┌─────────────────┐
│  Claude Mobile  │
│   /Web/Desktop  │
└────────┬────────┘
         │ HTTPS + OAuth2
         │
┌────────▼────────────────────────┐
│   MCP Todo Server (Go)          │
│  ┌──────────────────────────┐   │
│  │  OAuth2 Provider         │   │
│  │  - /oauth/authorize      │   │
│  │  - /oauth/token          │   │
│  │  - User Management       │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │  MCP Tools/Endpoints     │   │
│  │  - add_todo              │   │
│  │  - list_todos            │   │
│  │  - complete_todo         │   │
│  │  - add_shopping_item     │   │
│  │  - list_shopping         │   │
│  │  - add_reminder          │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │  Storage Interface       │   │
│  └──────────┬───────────────┘   │
└─────────────┼───────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐      ┌──────▼──────┐
│Postgres│      │Google Drive │
│Backend │      │Backend      │
└────────┘      └─────────────┘

┌─────────────────────────────────┐
│  Display Webapp (React)         │
│  - Todo List View               │
│  - Shopping List View           │
│  - Real-time Updates            │
└─────────────────────────────────┘
```

## Core Features

### 1. Multi-User Support
- Each self-hosted instance supports multiple users (e.g., family members)
- OAuth2 authentication for secure access
- User-specific todo lists and shopping lists

### 2. Configurable Storage Backends
- **Postgres**: Self-hosted database (default, recommended)
- **Google Drive**: Store as JSON files in user's Drive
- **Extensible**: Interface allows adding more backends (SQLite, Notion, etc.)

### 3. MCP Tools Exposed to Agents

#### Todo Management
- `add_todo(text, due_date?, priority?)` - Add item to todo list
- `list_todos(filter?)` - Get all todos (optionally filtered)
- `complete_todo(id)` - Mark todo as complete
- `delete_todo(id)` - Remove todo
- `update_todo(id, updates)` - Modify existing todo

#### Shopping List
- `add_shopping_item(item, quantity?)` - Add to shopping list
- `list_shopping()` - Get shopping list
- `remove_shopping_item(id)` - Remove from shopping list
- `clear_shopping_list()` - Clear entire list

#### Reminders
- `add_reminder(text, datetime)` - Create reminder
- `list_reminders()` - Get upcoming reminders
- `dismiss_reminder(id)` - Dismiss reminder

## Technical Stack

### Backend (MCP Server)
- **Language**: Go
- **Framework**: Standard library HTTP server + Gorilla Mux (or Chi)
- **OAuth2**: `github.com/go-oauth2/oauth2/v4`
- **Database**: 
  - PostgreSQL driver: `github.com/lib/pq`
  - Google Drive API: `google.golang.org/api/drive/v3`
- **Password Hashing**: `golang.org/x/crypto/bcrypt`

### Frontend (Display Webapp)
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Query for server state
- **Updates**: Polling or WebSocket for real-time updates

### Deployment
- **Container**: Docker + Docker Compose
- **Services**:
  - `mcp-server` - Go backend
  - `postgres` - Database (if using Postgres backend)
  - `webapp` - React display app (nginx)

## OAuth2 Implementation

### Flow

1. **User Adds Connector in Claude.ai**
   - Settings → Connectors → Add Custom Connector
   - Enter server URL: `https://user-server.example.com`
   - Select OAuth2 authentication

2. **Authorization Request**
   ```
   GET https://user-server.example.com/oauth/authorize
     ?client_id=claude
     &redirect_uri=https://claude.com/api/mcp/auth_callback
     &response_type=code
     &state=random-state
     &scope=todos shopping reminders
   ```

3. **User Login & Consent**
   - Server presents login page
   - User enters credentials (set during setup)
   - Server shows consent: "Allow Claude to access your todos?"
   - User approves

4. **Authorization Code Redirect**
   ```
   https://claude.com/api/mcp/auth_callback
     ?code=AUTH_CODE_HERE
     &state=random-state
   ```

5. **Token Exchange**
   ```
   POST https://user-server.example.com/oauth/token
   Content-Type: application/x-www-form-urlencoded
   
   grant_type=authorization_code
   &code=AUTH_CODE_HERE
   &redirect_uri=https://claude.com/api/mcp/auth_callback
   &client_id=claude
   ```

   **Response:**
   ```json
   {
     "access_token": "eyJhbGc...",
     "refresh_token": "refresh_token_here",
     "token_type": "Bearer",
     "expires_in": 3600
   }
   ```

6. **Token Refresh** (automatic by Claude)
   ```
   POST https://user-server.example.com/oauth/token
   
   grant_type=refresh_token
   &refresh_token=refresh_token_here
   &client_id=claude
   ```

### Security Considerations

- Passwords hashed with bcrypt (cost factor 12+)
- Tokens stored securely in database
- HTTPS required for all communication
- State parameter validation to prevent CSRF
- Token expiry: Access tokens (1 hour), Refresh tokens (30 days)
- Rate limiting on auth endpoints

## Storage Interface Design

### Go Interface
```go
type TodoStorage interface {
    // Todo operations
    AddTodo(ctx context.Context, userID string, todo Todo) error
    ListTodos(ctx context.Context, userID string, filter *TodoFilter) ([]Todo, error)
    GetTodo(ctx context.Context, userID string, todoID string) (*Todo, error)
    UpdateTodo(ctx context.Context, userID string, todoID string, updates TodoUpdates) error
    DeleteTodo(ctx context.Context, userID string, todoID string) error
    
    // Shopping operations
    AddShoppingItem(ctx context.Context, userID string, item ShoppingItem) error
    ListShoppingItems(ctx context.Context, userID string) ([]ShoppingItem, error)
    RemoveShoppingItem(ctx context.Context, userID string, itemID string) error
    ClearShoppingList(ctx context.Context, userID string) error
    
    // Reminder operations
    AddReminder(ctx context.Context, userID string, reminder Reminder) error
    ListReminders(ctx context.Context, userID string) ([]Reminder, error)
    DismissReminder(ctx context.Context, userID string, reminderID string) error
}
```

### Data Models
```go
type Todo struct {
    ID          string    `json:"id"`
    UserID      string    `json:"user_id"`
    Text        string    `json:"text"`
    Completed   bool      `json:"completed"`
    Priority    string    `json:"priority"` // low, medium, high
    DueDate     *time.Time `json:"due_date,omitempty"`
    CreatedAt   time.Time `json:"created_at"`
    CompletedAt *time.Time `json:"completed_at,omitempty"`
}

type ShoppingItem struct {
    ID        string    `json:"id"`
    UserID    string    `json:"user_id"`
    Item      string    `json:"item"`
    Quantity  string    `json:"quantity,omitempty"`
    CreatedAt time.Time `json:"created_at"`
}

type Reminder struct {
    ID          string    `json:"id"`
    UserID      string    `json:"user_id"`
    Text        string    `json:"text"`
    RemindAt    time.Time `json:"remind_at"`
    Dismissed   bool      `json:"dismissed"`
    CreatedAt   time.Time `json:"created_at"`
    DismissedAt *time.Time `json:"dismissed_at,omitempty"`
}
```

## Configuration

### config.yaml
```yaml
server:
  port: 8080
  base_url: "https://your-domain.com"
  
oauth:
  enabled: true
  client_id: "claude"
  access_token_ttl: 3600      # 1 hour
  refresh_token_ttl: 2592000  # 30 days
  
storage:
  type: "postgres"  # or "google_drive"
  
  postgres:
    host: "postgres"  # docker service name
    port: 5432
    database: "mcp_todos"
    user: "mcp_user"
    password: "${POSTGRES_PASSWORD}"  # from env
    
  google_drive:
    credentials_path: "/config/gdrive-credentials.json"
    folder_name: "MCP Todos"

logging:
  level: "info"  # debug, info, warn, error
  format: "json"
```

## User Setup Experience

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/mcp-todo-server
cd mcp-todo-server

# Run setup script
./setup.sh

# Setup will prompt for:
# - Admin username
# - Admin password
# - Storage backend choice (postgres/google_drive)
# - Remote access method (tailscale/cloudflare/port-forward)

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f mcp-server
```

### Adding to Claude

1. Go to https://claude.ai
2. Settings → Connectors → Add Custom Connector
3. Enter details:
   - **Name**: My Todo List
   - **Server URL**: `https://your-server-url.com`
   - **Auth Type**: OAuth 2.0
4. Click Connect
5. Login with credentials created during setup
6. Approve permissions
7. Done! Now available on mobile/web/desktop

## Display Webapp

### Features
- Clean, minimal UI for across-room viewing
- Real-time updates when items added via Claude
- Separate views for Todos and Shopping List
- Filter options (show completed, by priority, etc.)
- Click to mark items complete
- Responsive design for any screen size

### API Endpoints for Webapp
```
GET  /api/todos          # List all todos for user
GET  /api/shopping       # List shopping items
POST /api/todos/:id/complete  # Mark complete from UI
```

### Deployment
- Runs as separate container in docker-compose
- nginx serves static React build
- Proxies API calls to MCP server
- Optional: Basic auth for viewing (separate from OAuth)

## Development Roadmap

### Phase 1: Core Functionality (MVP)
- [ ] Basic Go HTTP server
- [ ] OAuth2 authentication
- [ ] Postgres storage backend
- [ ] Core MCP tools (add_todo, list_todos, add_shopping_item, list_shopping)
- [ ] Docker Compose setup
- [ ] Basic setup script

### Phase 2: Enhanced Features
- [ ] Complete todo management (update, delete, priorities, due dates)
- [ ] Reminders functionality
- [ ] Google Drive storage backend
- [ ] Display webapp (React)
- [ ] WebSocket support for real-time updates

### Phase 3: Polish & Documentation
- [ ] Comprehensive documentation
- [ ] Setup wizard improvements
- [ ] Health check endpoints
- [ ] Monitoring/logging
- [ ] Migration scripts
- [ ] Example configurations

### Phase 4: Community & Extensions
- [ ] Plugin system for custom backends
- [ ] Additional storage backends (SQLite, Notion, Todoist)
- [ ] Calendar integration
- [ ] Mobile app for display
- [ ] Shared lists (family features)

## API Examples

### Using MCP Tools via Claude

**Voice Command:**
> "Add buy groceries to my todo list"

**What Claude Does:**
```json
POST /mcp/tools/add_todo
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "text": "buy groceries",
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "todo": {
    "id": "todo_123",
    "text": "buy groceries",
    "completed": false,
    "priority": "medium",
    "created_at": "2025-12-20T10:30:00Z"
  }
}
```

**Voice Command:**
> "What's on my shopping list?"

**What Claude Does:**
```json
POST /mcp/tools/list_shopping
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": "shop_1",
      "item": "milk",
      "quantity": "2 gallons",
      "created_at": "2025-12-20T09:00:00Z"
    },
    {
      "id": "shop_2",
      "item": "bread",
      "created_at": "2025-12-20T09:15:00Z"
    }
  ]
}
```

## Security Best Practices

1. **Always use HTTPS** - Required for OAuth2 and protecting tokens
2. **Strong passwords** - Enforce minimum requirements during setup
3. **Token rotation** - Implement refresh token rotation
4. **Rate limiting** - Prevent brute force attacks on auth endpoints
5. **Audit logging** - Log all authentication attempts
6. **Principle of least privilege** - Users only access their own data
7. **Regular updates** - Keep dependencies up to date
8. **Secure secrets** - Use environment variables, never commit credentials

## Troubleshooting

### Common Issues

**OAuth redirect fails**
- Verify `base_url` in config matches actual server URL
- Check HTTPS is properly configured
- Ensure redirect_uri matches exactly

**Claude can't connect**
- Check firewall rules allow incoming HTTPS
- Verify Tailscale/tunnel is running
- Test with `curl https://your-server/health`

**Postgres connection errors**
- Wait for postgres container to be ready
- Check credentials match between config and docker-compose
- Verify network connectivity between containers

**Display webapp shows stale data**
- Check polling interval
- Verify API endpoints are accessible
- Check browser console for errors

## Contributing

Contributions welcome! Areas of interest:
- Additional storage backends
- UI improvements for display webapp
- Mobile display app
- Calendar integrations
- Enhanced reminder features
- Documentation improvements

## License

MIT License - see LICENSE file

## Resources

- [Model Context Protocol Spec](https://modelcontextprotocol.io)
- [Claude MCP Documentation](https://docs.anthropic.com/mcp)
- [OAuth 2.0 RFC](https://oauth.net/2/)
- [Go OAuth2 Library](https://github.com/go-oauth2/oauth2)

---

**Project Status**: 🚧 In Design Phase

**Target Users**: Tech-savvy individuals who want full control over their AI assistant's data

**Philosophy**: Privacy-first, self-hosted, open source
