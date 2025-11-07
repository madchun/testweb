# 🐳 Docker Deployment Guide

Deploy your Student Pilot Photo Generator using Docker for easy, consistent deployments.

## 📋 Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (usually comes with Docker Desktop)
- Your API keys ready (see [QUICKSTART.md](QUICKSTART.md))

## 🚀 Quick Start with Docker

### 1. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
nano .env
```

Add your configuration:

```env
NODE_ENV=production
PORT=3000
GOOGLE_AI_API_KEY=your_api_key_here
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
ALLOWED_ORIGIN=https://yourdomain.com
```

### 2. Build and Run

**Option A: Docker Compose (Recommended)**

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f pilot-app

# Stop the application
docker-compose down
```

**Option B: Docker Only**

```bash
# Build image
docker build -t pilot-photo-generator .

# Run container
docker run -d \
  --name pilot-app \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/generated:/app/generated \
  pilot-photo-generator

# View logs
docker logs -f pilot-app

# Stop container
docker stop pilot-app
docker rm pilot-app
```

### 3. Access Your Application

- Local: http://localhost:3000
- Network: http://your-server-ip:3000

## 🌐 Production Deployment with Nginx

For production with SSL/HTTPS support:

### 1. Update nginx.conf

Edit `nginx.conf` and replace `yourdomain.com` with your actual domain.

### 2. Start with Nginx

```bash
# Start app with Nginx reverse proxy
docker-compose --profile with-nginx up -d

# Check status
docker-compose ps
```

### 3. Setup SSL Certificate

**First-time SSL setup:**

```bash
# Get initial certificate
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your@email.com \
  --agree-tos \
  --no-eff-email

# Restart Nginx to use new certificates
docker-compose restart nginx
```

**Auto-renewal:**

Certbot container automatically renews certificates every 12 hours.

### 4. Configure DNS

Point your domain to your server IP:

```
Type    Name    Value
A       @       your-server-ip
A       www     your-server-ip
```

## 📦 Docker Commands Reference

### Container Management

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart specific service
docker-compose restart pilot-app

# View logs
docker-compose logs -f pilot-app

# Execute command in container
docker-compose exec pilot-app sh

# View container status
docker-compose ps

# Remove all containers and volumes
docker-compose down -v
```

### Image Management

```bash
# Build image
npm run docker:build
# or
docker-compose build

# Pull latest base images
docker-compose pull

# Remove unused images
docker image prune -a

# View images
docker images
```

### Debugging

```bash
# View app logs
docker-compose logs -f pilot-app

# View Nginx logs
docker-compose logs -f nginx

# Enter container shell
docker-compose exec pilot-app sh

# Check container health
docker inspect --format='{{.State.Health.Status}}' pilot-photo-generator

# Monitor resource usage
docker stats
```

## 🔧 Customization

### Modify Environment Variables

```bash
# Edit .env file
nano .env

# Restart containers
docker-compose restart
```

### Update Application Code

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Scale Application

```bash
# Run multiple instances (requires load balancer)
docker-compose up -d --scale pilot-app=3
```

## 🎯 Cloud Platform Deployment

### Deploy to DigitalOcean

1. **Create Droplet with Docker**:
   - Choose "Docker" from Marketplace
   - Select size (minimum 1GB RAM)

2. **SSH into droplet**:
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Clone and setup**:
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo/app
   nano .env  # Add your configuration
   docker-compose --profile with-nginx up -d
   ```

4. **Setup SSL**:
   ```bash
   docker-compose run --rm certbot certonly --webroot \
     --webroot-path=/var/www/certbot \
     -d yourdomain.com \
     --email your@email.com \
     --agree-tos
   docker-compose restart nginx
   ```

### Deploy to AWS EC2

1. **Launch EC2 instance** with Docker

2. **Install Docker Compose**:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Follow DigitalOcean steps** above

### Deploy to Google Cloud Run

Create `cloudbuild.yaml`:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/pilot-app', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/pilot-app']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'pilot-app'
      - '--image'
      - 'gcr.io/$PROJECT_ID/pilot-app'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
```

Deploy:

```bash
gcloud builds submit --config cloudbuild.yaml
```

### Deploy to Azure Container Instances

```bash
# Login
az login

# Create resource group
az group create --name pilot-rg --location eastus

# Create container
az container create \
  --resource-group pilot-rg \
  --name pilot-app \
  --image your-registry.azurecr.io/pilot-app:latest \
  --dns-name-label pilot-app-unique \
  --ports 3000 \
  --environment-variables \
    NODE_ENV=production \
    GOOGLE_AI_API_KEY=$GOOGLE_AI_API_KEY
```

## 🔐 Security Best Practices

### 1. Non-root User

The Dockerfile already uses a non-root user (nodejs:nodejs).

### 2. Environment Variables

Never commit `.env` file. Use Docker secrets in production:

```bash
# Create secrets
echo "your_api_key" | docker secret create google_ai_key -
echo "your_json" | docker secret create google_service_key -

# Update docker-compose.yml to use secrets
```

### 3. Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  pilot-app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 4. Health Checks

Already included in Dockerfile and docker-compose.yml.

### 5. Network Isolation

Containers communicate via internal network, not exposed to host.

## 📊 Monitoring

### View Health Status

```bash
# Check health
curl http://localhost:3000/api/health

# Container health
docker inspect --format='{{json .State.Health}}' pilot-photo-generator | jq
```

### Monitor Resources

```bash
# Real-time stats
docker stats

# Disk usage
docker system df
```

### Setup Monitoring Stack (Optional)

Use Prometheus + Grafana:

```yaml
# Add to docker-compose.yml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
```

## 🧹 Maintenance

### Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

### Backup

```bash
# Backup generated images
docker cp pilot-photo-generator:/app/generated ./backup/

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker cp pilot-photo-generator:/app/generated ./backup/generated_$DATE
```

### Update

```bash
# Pull latest code
git pull

# Rebuild and restart with zero downtime
docker-compose up -d --build --no-deps pilot-app
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs pilot-app

# Check configuration
docker-compose config

# Validate Dockerfile
docker build --no-cache -t pilot-app .
```

### Out of disk space

```bash
# Check disk usage
docker system df

# Cleanup
docker system prune -a --volumes

# Remove old generated images
rm -rf generated/*
```

### Permission errors

```bash
# Fix volume permissions
sudo chown -R 1001:1001 generated uploads
```

### Network issues

```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

## 📝 Tips

1. **Use .dockerignore** to reduce image size
2. **Multi-stage builds** reduce final image size
3. **Volume mounts** for development, images in production
4. **Health checks** ensure container reliability
5. **Resource limits** prevent container from consuming all resources
6. **Logging** to external service (CloudWatch, Datadog, etc.)

## 🆘 Getting Help

- Docker documentation: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- Troubleshooting: Check main [README.md](README.md)

---

Happy containerizing! 🐳
