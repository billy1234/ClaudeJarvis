# SSL Certificate Generation Script for Jarvis (PowerShell)
# This script helps you generate SSL certificates for local or production use

Write-Host "=== Jarvis SSL Certificate Generator ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose your certificate option:"
Write-Host "1) mkcert - Locally-trusted certificates (best for local network)"
Write-Host "2) Self-signed - Works anywhere but shows browser warnings"
Write-Host "3) Manual - I'll provide my own certificates"
Write-Host ""
$choice = Read-Host "Enter your choice (1-3)"

New-Item -ItemType Directory -Force -Path "nginx/ssl" | Out-Null

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "=== Using mkcert ===" -ForegroundColor Cyan

        # Check if mkcert is installed
        if (-not (Get-Command mkcert -ErrorAction SilentlyContinue)) {
            Write-Host "mkcert is not installed. Please install it first:" -ForegroundColor Red
            Write-Host "  Windows: choco install mkcert"
            Write-Host "  Or download from: https://github.com/FiloSottile/mkcert/releases"
            exit 1
        }

        # Install local CA
        Write-Host "Installing local CA (you may see a security prompt)..." -ForegroundColor Yellow
        mkcert -install

        # Get domain name
        $domain = Read-Host "Enter your domain name (e.g. jarvis.local)"

        # Get local IP
        Write-Host ""
        Write-Host "Detecting network interfaces..." -ForegroundColor Yellow
        Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" } | Format-Table IPAddress
        $localip = Read-Host "Enter your local IP address"

        # Generate certificate
        Write-Host ""
        Write-Host "Generating certificate for: localhost, $domain, *.$domain, $localip" -ForegroundColor Yellow
        mkcert -key-file nginx/ssl/key.pem -cert-file nginx/ssl/cert.pem localhost $domain "*.$domain" $localip

        Write-Host ""
        Write-Host "[OK] Certificate generated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Add this to your hosts file (C:\Windows\System32\drivers\etc\hosts):"
        Write-Host "$localip $domain"
    }

    "2" {
        Write-Host ""
        Write-Host "=== Self-Signed Certificate ===" -ForegroundColor Cyan

        $domain = Read-Host "Enter your domain name (e.g. jarvis.local)"
        $localip = Read-Host "Enter your local IP address (optional, press Enter to skip)"

        # Build SAN
        $san = "DNS:${domain},DNS:*.${domain},DNS:localhost,IP:127.0.0.1"
        if ($localip) {
            $san = "${san},IP:${localip}"
        }

        # Create OpenSSL config for SAN
        $configContent = @"
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=US
ST=State
L=City
O=Jarvis
CN=${domain}

[v3_req]
subjectAltName = ${san}
"@
        $configFile = "nginx/ssl/openssl.conf"
        $configContent | Out-File -FilePath $configFile -Encoding ASCII

        # Generate certificate
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -config $configFile -extensions v3_req

        # Clean up config file
        Remove-Item $configFile

        Write-Host ""
        Write-Host "[OK] Self-signed certificate generated!" -ForegroundColor Green
        Write-Host ""
        Write-Host "[WARNING] Browsers will show security warnings. You'll need to accept them." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Add this to your hosts file (C:\Windows\System32\drivers\etc\hosts):"
        if ($localip) {
            Write-Host "$localip $domain"
        } else {
            Write-Host "127.0.0.1 $domain"
        }
    }

    "3" {
        Write-Host ""
        Write-Host "=== Manual Certificate Setup ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Please place your certificate files in:"
        Write-Host "  nginx/ssl/cert.pem  - Your certificate (full chain)"
        Write-Host "  nginx/ssl/key.pem   - Your private key"
        Write-Host ""
        Read-Host "Press Enter when done"

        if ((Test-Path "nginx/ssl/cert.pem") -and (Test-Path "nginx/ssl/key.pem")) {
            Write-Host "[OK] Certificate files found!" -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Certificate files not found. Please add them before starting services." -ForegroundColor Red
            exit 1
        }
    }

    default {
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Copy .env.example to .env and configure your credentials"
Write-Host "2. Build frontend: cd frontend && npm run build"
Write-Host "3. Start services: docker-compose up -d"
Write-Host "4. Access your application via HTTPS"
Write-Host ""
