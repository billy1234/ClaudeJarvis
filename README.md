# Jarvis

A Docker-based application stack with PostgreSQL, Nginx (HTTPS), and a Go-based MCP server.

## Architecture

- **PostgreSQL 16**: Database server
- **Nginx**: HTTPS-only web server and reverse proxy
- **MCP Server**: Go-based API server with database connectivity

## Prerequisites

- Docker
- Docker Compose
- OpenSSL (for generating SSL certificates)

## Setup

### 1. Environment Configuration

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Edit `.env` and set your database credentials and ports:

```env
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=your_db_name
DB_PORT=5432
WEB_HTTPS_PORT=443
MCP_PORT=8080
```

### 2. SSL Certificates

**Quick Start:** Use the provided helper script to generate certificates interactively:

```bash
# Linux/macOS
./generate-ssl.sh

# Windows PowerShell
.\generate-ssl.ps1
```

Or choose one of the options below manually:

#### Option A: Local Network with Trusted Certificates (Recommended for Development)

Using [mkcert](https://github.com/FiloSottile/mkcert) creates locally-trusted certificates that work in browsers without warnings:

```bash
# Install mkcert (one-time setup)
# macOS: brew install mkcert
# Windows: choco install mkcert
# Linux: See https://github.com/FiloSottile/mkcert#installation

# Install local CA
mkcert -install

# Generate certificate for your domain
mkdir -p nginx/ssl
mkcert -key-file nginx/ssl/key.pem -cert-file nginx/ssl/cert.pem \
  localhost jarvis.local 192.168.1.100 "*.jarvis.local"
```

Replace `192.168.1.100` with your machine's local IP. Add any custom domains you want to use on your network.

#### Option B: Self-Signed Certificate (Quick Start)

Generate a self-signed certificate for a custom domain:

```bash
mkdir -p nginx/ssl

# Replace jarvis.local with your desired domain
DOMAIN="jarvis.local"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Jarvis/CN=${DOMAIN}" \
  -addext "subjectAltName=DNS:${DOMAIN},DNS:*.${DOMAIN},DNS:localhost,IP:127.0.0.1"
```

**Note:** Browsers will show security warnings for self-signed certificates. You'll need to accept the warning to proceed.

To use a custom domain like `jarvis.local` on your network, add it to your hosts file or DNS server.

#### Option C: Production with Cloudflare or Let's Encrypt

For public internet access, use a trusted Certificate Authority:

**Using Cloudflare:**
1. Point your domain to your server IP in Cloudflare DNS
2. Generate an Origin Certificate in Cloudflare SSL/TLS settings
3. Download the certificate and key, save as:
   - `nginx/ssl/cert.pem` (certificate)
   - `nginx/ssl/key.pem` (private key)

**Using Let's Encrypt (certbot):**
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate (standalone mode - stop nginx first)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown $USER:$USER nginx/ssl/*.pem
```

Set up auto-renewal with certbot's renewal hooks.

### 3. Start the Services

```bash
docker-compose up -d
```

### 4. Verify Services

Check that all services are running:

```bash
docker-compose ps
```

Test the health endpoint:

```bash
curl -k https://localhost/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

## Service Endpoints

- **Web Interface**: `https://localhost:443`
- **MCP API**: `https://localhost/api/mcp`
- **Health Check**: `https://localhost/health`
- **PostgreSQL**: `localhost:5432`
- **MCP Server (direct)**: `localhost:8080`

## Development

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mcp-server
docker-compose logs -f postgres
docker-compose logs -f web
```

### Rebuild Services

```bash
# Rebuild all
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build mcp-server
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes

```bash
docker-compose down -v
```

## Project Structure

```
.
├── docker-compose.yml          # Docker Compose configuration
├── .env.example               # Environment template
├── .env                       # Your environment (not in git)
├── generate-ssl.sh            # SSL certificate generator (Linux/macOS)
├── generate-ssl.ps1           # SSL certificate generator (Windows)
├── README.md                  # This file
├── mcp-server/               # MCP Go server
│   ├── Dockerfile
│   ├── main.go
│   ├── go.mod
│   └── go.sum
└── nginx/                    # Nginx configuration
    ├── nginx.conf            # Nginx config
    ├── html/                 # Static files
    │   └── index.html
    └── ssl/                  # SSL certificates
        ├── cert.pem
        └── key.pem
```

## Database Access

Connect to PostgreSQL:

```bash
docker-compose exec postgres psql -U <DB_USER> -d <DB_NAME>
```

## Troubleshooting

### Certificate Issues

If you get certificate errors, make sure you generated the SSL certificates in the `nginx/ssl` directory.

### Connection Refused

If services can't connect, check:
1. All containers are running: `docker-compose ps`
2. Check logs: `docker-compose logs`
3. Verify network: `docker network ls`

### Database Connection Issues

If the MCP server can't connect to PostgreSQL:
1. Verify credentials in `.env`
2. Check PostgreSQL logs: `docker-compose logs postgres`
3. Ensure database is healthy: `docker-compose ps`

## Security Notes

- The default configuration uses self-signed certificates for development only
- Change all default credentials in production
- Use proper SSL certificates from a trusted CA in production
- Consider using Docker secrets for sensitive data in production
- The PostgreSQL port is exposed for development; restrict in production
- **The MCP server port (8080) is exposed for development/debugging**. In production, remove the port mapping from `docker-compose.yml` so the MCP server is only accessible through Nginx HTTPS. Change:
  ```yaml
  # Remove this in production:
  ports:
    - "${MCP_PORT:-8080}:${MCP_PORT:-8080}"
  ```
  This ensures all traffic goes through the reverse proxy with proper SSL encryption
