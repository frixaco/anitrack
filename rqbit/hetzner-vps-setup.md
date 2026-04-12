# Hetzner VPS Setup Guide

This guide covers setting up a Hetzner VPS with Ubuntu to run a Docker Compose application with HTTPS domain configuration.

## Prerequisites
- Hetzner VPS with Ubuntu
- Domain `rqbit.anitrack.frixaco.com` configured in DNS provider
- Firewall configured with ports 22, 3030, 4240, and ICMP
- SSH keys set up

## Step 1: Initial Server Setup

### Connect to your VPS
```bash
ssh root@your-vps-ip
```

### Update system
```bash
apt update && apt upgrade -y
```

### Install essential packages
```bash
apt install -y curl wget git ufw nginx certbot python3-certbot-nginx
```

## Step 2: Install Docker and Docker Compose

### Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### Install Docker Compose
```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### Start Docker service
```bash
systemctl start docker
systemctl enable docker
```

## Step 3: Configure UFW Firewall (Optional - since Hetzner firewall is configured)

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3030/tcp
ufw allow 4240/tcp
ufw --force enable
```

## Step 4: Setup Nginx Reverse Proxy

### Create Nginx configuration
```bash
nano /etc/nginx/sites-available/rqbit.anitrack.frixaco.com
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name rqbit.anitrack.frixaco.com;

    location / {
        proxy_pass http://localhost:3030;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

### Enable the site
```bash
ln -s /etc/nginx/sites-available/rqbit.anitrack.frixaco.com /etc/nginx/sites-enabled/
```

### Test and reload Nginx
```bash
nginx -t
systemctl reload nginx
```

## Step 5: Deploy Your Application

### Upload your docker-compose.yaml
Transfer your `docker-compose.yaml` file to the server (or just copy paste):
```bash
# From your local machine
scp docker-compose.yaml root@your-vps-ip:/opt/anitrack/
```

### Start the application
```bash
docker-compose up -d
```

### Verify application is running
```bash
docker-compose ps
curl localhost:3030
```

## Step 6: Configure HTTPS with Let's Encrypt

### Prerequisites: Open HTTP/HTTPS ports in Hetzner firewall
**IMPORTANT**: You need to add ports 80 and 443 to your Hetzner firewall rules:
1. Go to Hetzner Cloud Console → Firewalls
2. Edit your firewall
3. Add inbound rules:
   - Port 80 (HTTP) - Source: 0.0.0.0/0
   - Port 443 (HTTPS) - Source: 0.0.0.0/0

### Troubleshooting before certificate generation
Test if your domain resolves and nginx is accessible:
```bash
# Test domain resolution
nslookup rqbit.anitrack.frixaco.com

# Test if nginx is running
systemctl status nginx

# Test if port 80 is accessible locally
curl -I http://localhost

# Test if your domain is accessible (from another machine or online tool)
curl -I http://rqbit.anitrack.frixaco.com
```

### Obtain SSL certificate
```bash
certbot --nginx -d rqbit.anitrack.frixaco.com
```

Follow the prompts to:
- Enter your email address
- Agree to terms of service
- Choose whether to share email with EFF
- Select option 2 to redirect HTTP to HTTPS

### Verify SSL certificate
```bash
certbot certificates
```

### Set up automatic renewal
```bash
crontab -e
```

Add this line to renew certificates automatically:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 7: Create Systemd Service (Optional)

Create a systemd service to manage your application:

```bash
nano /etc/systemd/system/anitrack.service
```

Add the following content:
```ini
[Unit]
Description=Anitrack Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

### Enable and start the service
```bash
systemctl daemon-reload
systemctl enable anitrack.service
systemctl start anitrack.service
```

## Step 8: Configure DNS

Ensure your domain provider has an A record pointing to your VPS IP:
```
rqbit.anitrack.frixaco.com. IN A your-vps-ip
```

## Step 9: Verify Setup

### Check application status
```bash
docker-compose ps
systemctl status anitrack
```

### Test HTTPS connection
```bash
curl -I https://rqbit.anitrack.frixaco.com
```

### Check logs
```bash
docker-compose logs -f
tail -f /var/log/nginx/access.log
```

## Maintenance Commands

### Update application
```bash
cd /opt/anitrack
docker-compose pull
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f [service-name]
```

### Restart services
```bash
docker-compose restart
systemctl restart nginx
```

### Check certificate expiry
```bash
certbot certificates
```

## Troubleshooting

### Common issues:
1. **Port not accessible**: Check Hetzner firewall settings
2. **Domain not resolving**: Verify DNS A record
3. **SSL certificate issues**: Check domain ownership and DNS propagation
4. **Docker compose fails**: Check file permissions and syntax

### Useful commands:
```bash
# Check running containers
docker ps

# Check nginx status
systemctl status nginx

# Check SSL certificate
openssl s_client -connect rqbit.anitrack.frixaco.com:443

# Test nginx configuration
nginx -t
```

## Security Recommendations

1. **Disable root login**: Create a non-root user
2. **Change SSH port**: Modify `/etc/ssh/sshd_config`
3. **Regular updates**: Keep system and Docker updated
4. **Monitor logs**: Set up log monitoring
5. **Backup**: Regular backups of your application data

Your application should now be accessible at `https://rqbit.anitrack.frixaco.com` with automatic HTTP to HTTPS redirection.
