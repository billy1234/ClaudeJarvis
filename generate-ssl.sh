#!/bin/bash

# SSL Certificate Generation Script for Jarvis
# This script helps you generate SSL certificates for local or production use

set -e

echo "=== Jarvis SSL Certificate Generator ==="
echo ""
echo "Choose your certificate option:"
echo "1) mkcert - Locally-trusted certificates (best for local network)"
echo "2) Self-signed - Works anywhere but shows browser warnings"
echo "3) Let's Encrypt - For public domains with auto-renewal"
echo "4) Manual - I'll provide my own certificates"
echo ""
read -p "Enter your choice (1-4): " choice

mkdir -p nginx/ssl

case $choice in
  1)
    echo ""
    echo "=== Using mkcert ==="

    # Check if mkcert is installed
    if ! command -v mkcert &> /dev/null; then
      echo "mkcert is not installed. Please install it first:"
      echo "  macOS: brew install mkcert"
      echo "  Windows: choco install mkcert"
      echo "  Linux: https://github.com/FiloSottile/mkcert#installation"
      exit 1
    fi

    # Install local CA if not already installed
    echo "Installing local CA (you may be prompted for your password)..."
    mkcert -install

    # Get domain name
    read -p "Enter your domain name (e.g., jarvis.local): " domain

    # Get local IP
    echo ""
    echo "Detecting network interfaces..."
    if command -v ip &> /dev/null; then
      ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1
    elif command -v ipconfig &> /dev/null; then
      ipconfig | grep "IPv4" | awk '{print $NF}'
    else
      ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
    fi
    echo ""
    read -p "Enter your local IP address: " localip

    # Generate certificate
    echo ""
    echo "Generating certificate for: localhost, $domain, *.$domain, $localip"
    mkcert -key-file nginx/ssl/key.pem -cert-file nginx/ssl/cert.pem \
      localhost "$domain" "*.$domain" "$localip"

    echo ""
    echo "✓ Certificate generated successfully!"
    echo ""
    echo "Add this to your hosts file or local DNS:"
    echo "$localip $domain"
    ;;

  2)
    echo ""
    echo "=== Self-Signed Certificate ==="

    read -p "Enter your domain name (e.g., jarvis.local): " domain

    # Get local IP
    read -p "Enter your local IP address (optional, press Enter to skip): " localip

    # Build SAN
    san="DNS:${domain},DNS:*.${domain},DNS:localhost,IP:127.0.0.1"
    if [ -n "$localip" ]; then
      san="${san},IP:${localip}"
    fi

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout nginx/ssl/key.pem \
      -out nginx/ssl/cert.pem \
      -subj "/C=US/ST=State/L=City/O=Jarvis/CN=${domain}" \
      -addext "subjectAltName=${san}"

    echo ""
    echo "✓ Self-signed certificate generated!"
    echo ""
    echo "⚠️  Browsers will show security warnings. You'll need to accept them."
    echo ""
    echo "Add this to your hosts file:"
    if [ -n "$localip" ]; then
      echo "$localip $domain"
    else
      echo "127.0.0.1 $domain"
    fi
    ;;

  3)
    echo ""
    echo "=== Let's Encrypt Certificate ==="
    echo ""

    read -p "Enter your public domain name: " domain
    read -p "Enter additional domains (optional, space-separated): " additional

    # Build domain args
    domain_args="-d $domain"
    for d in $additional; do
      domain_args="$domain_args -d $d"
    done

    echo ""
    echo "Make sure:"
    echo "1. Your domain DNS points to this server's public IP"
    echo "2. Port 80 is accessible from the internet (for verification)"
    echo "3. Docker services are stopped (we need port 80)"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to cancel..."

    # Stop services
    if [ -f "docker-compose.yml" ]; then
      docker-compose down 2>/dev/null || true
    fi

    # Check for certbot
    if ! command -v certbot &> /dev/null; then
      echo "certbot is not installed. Installing..."
      sudo apt-get update
      sudo apt-get install -y certbot
    fi

    # Get certificate
    sudo certbot certonly --standalone $domain_args

    # Copy certificates
    sudo cp "/etc/letsencrypt/live/$domain/fullchain.pem" nginx/ssl/cert.pem
    sudo cp "/etc/letsencrypt/live/$domain/privkey.pem" nginx/ssl/key.pem
    sudo chown $USER:$USER nginx/ssl/*.pem

    echo ""
    echo "✓ Let's Encrypt certificate generated!"
    echo ""
    echo "Set up auto-renewal with: sudo certbot renew --dry-run"
    ;;

  4)
    echo ""
    echo "=== Manual Certificate Setup ==="
    echo ""
    echo "Please place your certificate files in:"
    echo "  nginx/ssl/cert.pem  - Your certificate (full chain)"
    echo "  nginx/ssl/key.pem   - Your private key"
    echo ""
    echo "Press Enter when done..."
    read

    if [ -f "nginx/ssl/cert.pem" ] && [ -f "nginx/ssl/key.pem" ]; then
      echo "✓ Certificate files found!"
    else
      echo "⚠️  Certificate files not found. Please add them before starting services."
      exit 1
    fi
    ;;

  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "=== Next Steps ==="
echo "1. Copy .env.example to .env and configure your credentials"
echo "2. Start services: docker-compose up -d"
echo "3. Access your application via HTTPS"
echo ""
