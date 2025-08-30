# 🚀 ha-cleanup Production Deployment Guide

## 📋 Overview

This guide covers deploying the ha-cleanup application to production using Docker. The application is a mobile-first React web app for analyzing Home Assistant historical data from ha-ingestor deployments.

## 🎯 Prerequisites

- Docker and Docker Compose installed
- Access to InfluxDB instance (from ha-ingestor or standalone)
- Node.js 18+ (for local development builds)
- Git

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │  ha-cleanup     │    │   InfluxDB      │
│   (Port 80/443) │◄──►│  (Port 3000)    │◄──►│   (Port 8086)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🐳 Docker Deployment

### Quick Start (Production)

1. **Clone and Build:**
```bash
git clone <repository-url>
cd ha-cleanup
npm install
npm run build
```

2. **Create Production Environment:**
```bash
cp .env.example .env.production
# Edit .env.production with your InfluxDB credentials
```

3. **Deploy with Docker Compose:**
```bash
docker-compose -f docker-compose.production.yml up -d
```

### Production Docker Compose

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  ha-cleanup:
    build:
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - INFLUXDB_URL=${INFLUXDB_URL}
      - INFLUXDB_TOKEN=${INFLUXDB_TOKEN}
      - INFLUXDB_ORG=${INFLUXDB_ORG}
      - INFLUXDB_BUCKET=${INFLUXDB_BUCKET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - ha-cleanup
    restart: unless-stopped
```

## 🔧 Configuration

### Environment Variables

```bash
# .env.production
NODE_ENV=production
INFLUXDB_URL=http://your-influxdb:8086
INFLUXDB_TOKEN=your_readonly_token
INFLUXDB_ORG=your_org
INFLUXDB_BUCKET=ha_events
PORT=3000
```

### InfluxDB Connection

1. **Get Read-Only Token:**
   - Access your InfluxDB instance
   - Go to Data > API Tokens
   - Create a new token with read-only access to your bucket

2. **Verify Connection:**
   - Test connection using the health check endpoint
   - Monitor logs for connection issues

## 📱 Production Features

### Performance Optimizations
- ✅ Code splitting implemented
- ✅ Lazy loading for all pages
- ✅ Vendor chunking for better caching
- ✅ Gzip compression enabled
- ✅ Core Web Vitals monitoring

### Mobile Optimization
- ✅ Touch-friendly controls
- ✅ Responsive design across all screen sizes
- ✅ PWA-ready (can be extended)
- ✅ Optimized bundle sizes

## 🔒 Security

### Production Security Checklist
- [ ] HTTPS enabled with valid SSL certificate
- [ ] InfluxDB token is read-only
- [ ] No sensitive data in client-side code
- [ ] Environment variables properly secured
- [ ] Regular security updates

### SSL Configuration

```nginx
# nginx/nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://ha-cleanup:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoring & Health Checks

### Health Endpoints
- `GET /health` - Application health status
- `GET /health/influxdb` - InfluxDB connection status
- `GET /metrics` - Performance metrics (if enabled)

### Logging
```bash
# View application logs
docker-compose logs -f ha-cleanup

# View nginx logs
docker-compose logs -f nginx
```

## 🚀 Deployment Steps

### Step 1: Build Production Image
```bash
docker build -f Dockerfile.production -t ha-cleanup:latest .
```

### Step 2: Deploy Services
```bash
docker-compose -f docker-compose.production.yml up -d
```

### Step 3: Verify Deployment
```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# Test health endpoint
curl http://localhost/health

# Check InfluxDB connection
curl http://localhost/health/influxdb
```

### Step 4: Monitor Performance
- Open browser dev tools
- Check Core Web Vitals
- Monitor bundle loading times
- Verify mobile responsiveness

## 🔄 Updates & Maintenance

### Rolling Updates
```bash
# Build new image
docker build -f Dockerfile.production -t ha-cleanup:latest .

# Update service
docker-compose -f docker-compose.production.yml up -d --no-deps ha-cleanup
```

### Backup & Recovery
```bash
# Backup configuration
docker-compose -f docker-compose.production.yml config > backup.yml

# Restore from backup
docker-compose -f backup.yml up -d
```

## 🐛 Troubleshooting

### Common Issues

1. **InfluxDB Connection Failed**
   - Verify token permissions
   - Check network connectivity
   - Validate bucket name

2. **Build Failures**
   - Ensure Node.js 18+ is installed
   - Clear node_modules and reinstall
   - Check TypeScript compilation

3. **Performance Issues**
   - Monitor bundle sizes
   - Check Core Web Vitals
   - Verify code splitting is working

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development DEBUG=* npm start

# View detailed Docker logs
docker-compose logs -f --tail=100 ha-cleanup
```

## 📚 Additional Resources

- [Home Assistant Documentation](https://www.home-assistant.io/)
- [InfluxDB Documentation](https://docs.influxdata.com/)
- [React Performance Best Practices](https://react.dev/learn/render-and-commit)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Application loads in under 3 seconds
- ✅ All pages render correctly on mobile and desktop
- ✅ InfluxDB data loads and displays properly
- ✅ Health checks return 200 OK
- ✅ SSL certificate is valid
- ✅ Performance metrics meet Core Web Vitals standards

---

**Need Help?** Check the troubleshooting section or create an issue in the repository.
