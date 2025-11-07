# 🌐 Production Deployment Guide

Deploy your Student Pilot Photo Generator to a public domain for access from anywhere.

## 📋 Prerequisites

- [ ] Domain name (e.g., from Namecheap, GoDaddy, Google Domains)
- [ ] Cloud hosting account (see options below)
- [ ] Google AI API key
- [ ] Google Drive API service account
- [ ] Basic command line knowledge

## 🚀 Deployment Options

### Option 1: DigitalOcean (Recommended for Beginners)

**Cost**: ~$6/month for basic droplet

#### Step-by-Step:

1. **Create a Droplet**
   ```bash
   # Choose:
   - Ubuntu 22.04 LTS
   - Basic Plan ($6/month - 1GB RAM)
   - Datacenter nearest to you
   ```

2. **Connect to Your Server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   node --version  # Verify installation
   ```

4. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   ```

5. **Setup Your App**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo/app
   npm install --production
   ```

6. **Configure Environment**
   ```bash
   nano .env
   # Add your API keys and configuration
   ```

7. **Start with PM2**
   ```bash
   pm2 start server/index.js --name pilot-app
   pm2 startup  # Auto-start on reboot
   pm2 save
   ```

8. **Install Nginx (Reverse Proxy)**
   ```bash
   apt-get install nginx
   ```

9. **Configure Nginx**
   ```bash
   nano /etc/nginx/sites-available/pilot-app
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       client_max_body_size 10M;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

10. **Enable Site**
    ```bash
    ln -s /etc/nginx/sites-available/pilot-app /etc/nginx/sites-enabled/
    nginx -t  # Test configuration
    systemctl restart nginx
    ```

11. **Setup SSL with Let's Encrypt (REQUIRED for camera access)**
    ```bash
    apt-get install certbot python3-certbot-nginx
    certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```

12. **Configure Domain DNS**
    - Go to your domain registrar
    - Add A record: `@` → `your-server-ip`
    - Add A record: `www` → `your-server-ip`
    - Wait 5-15 minutes for DNS propagation

### Option 2: Google Cloud Platform (Free Tier Available)

**Cost**: Free for 3 months, then ~$10/month

1. **Create VM Instance**
   - Go to Google Cloud Console
   - Create Compute Engine VM
   - Choose e2-micro (free tier eligible)
   - Select Ubuntu 22.04
   - Allow HTTP/HTTPS traffic

2. **Follow similar steps as DigitalOcean** (steps 2-12 above)

3. **Additional: Setup Firewall**
   ```bash
   # In Google Cloud Console
   VPC Network → Firewall → Create Firewall Rule
   - Allow TCP port 80
   - Allow TCP port 443
   ```

### Option 3: AWS EC2

**Cost**: Free tier 12 months, then ~$10/month

1. **Launch EC2 Instance**
   - Choose Amazon Linux 2 or Ubuntu
   - t2.micro (free tier eligible)
   - Configure security group (ports 22, 80, 443)

2. **Connect via SSH**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Follow installation steps** similar to DigitalOcean

### Option 4: Heroku (Easiest, but more expensive)

**Cost**: ~$7/month per dyno

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd app
   heroku create your-app-name
   ```

3. **Add Buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Configure Environment Variables**
   ```bash
   heroku config:set GOOGLE_AI_API_KEY=your_key
   heroku config:set GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
   heroku config:set GOOGLE_DRIVE_FOLDER_ID=your_folder_id
   ```

5. **Create Procfile**
   Create `app/Procfile`:
   ```
   web: node server/index.js
   ```

6. **Deploy**
   ```bash
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```

7. **Add Custom Domain**
   ```bash
   heroku domains:add www.yourdomain.com
   # Follow instructions to configure DNS
   ```

8. **Enable SSL**
   ```bash
   heroku certs:auto:enable
   ```

### Option 5: Railway (Modern, Simple)

**Cost**: $5/month + usage

1. **Visit**: https://railway.app
2. **Click "Start a New Project"**
3. **Deploy from GitHub**:
   - Connect your repository
   - Select the app directory
   - Add environment variables
4. **Add Custom Domain** in project settings
5. **SSL is automatic**

## 🔒 Production Security Checklist

### 1. Environment Variables
```bash
# Never commit these!
- GOOGLE_AI_API_KEY
- GOOGLE_SERVICE_ACCOUNT_KEY
- GOOGLE_DRIVE_FOLDER_ID
```

### 2. Add Rate Limiting
Install in your app:
```bash
npm install express-rate-limit
```

### 3. Add Helmet (Security Headers)
```bash
npm install helmet
```

### 4. Setup Firewall
```bash
# Ubuntu/Debian
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 5. Regular Updates
```bash
# Setup automatic security updates
apt-get install unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

### 6. Monitoring
```bash
# View app logs
pm2 logs pilot-app

# Monitor resources
pm2 monit
```

## 📱 SSL Certificate (REQUIRED)

**Why**: Modern browsers require HTTPS for camera access!

**Free SSL with Let's Encrypt**:
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Auto-renewal**:
```bash
# Test renewal
certbot renew --dry-run

# Certbot automatically sets up cron job for renewal
```

## 🌍 Domain Configuration

### After Purchasing Your Domain:

1. **Login to Domain Registrar** (Namecheap, GoDaddy, etc.)

2. **Configure DNS Records**:
   ```
   Type    Name    Value               TTL
   A       @       your-server-ip      Automatic
   A       www     your-server-ip      Automatic
   ```

3. **Wait for Propagation** (5-60 minutes)

4. **Test**:
   ```bash
   # Check DNS
   nslookup yourdomain.com

   # Check website
   curl https://yourdomain.com
   ```

## 🔧 Production Environment Variables

Create `.env` on your server:

```env
NODE_ENV=production
PORT=3000

# Google AI API
GOOGLE_AI_API_KEY=your_production_key

# Google Drive API
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Optional: Sentry for error tracking
SENTRY_DSN=your_sentry_dsn
```

## 📊 Monitoring & Maintenance

### View Logs:
```bash
pm2 logs pilot-app --lines 100
```

### Restart App:
```bash
pm2 restart pilot-app
```

### Update App:
```bash
cd /var/www/your-repo
git pull
cd app
npm install
pm2 restart pilot-app
```

### Check Server Resources:
```bash
pm2 monit
htop  # Install: apt-get install htop
df -h  # Disk space
```

### Backup Strategy:
```bash
# Backup generated images
rsync -avz /var/www/your-repo/app/generated/ /backup/generated/

# Automated backup with cron
crontab -e
# Add: 0 2 * * * rsync -avz /var/www/your-repo/app/generated/ /backup/generated/
```

## 🚦 Testing Your Deployment

1. **Health Check**:
   ```bash
   curl https://yourdomain.com/api/health
   ```

2. **Upload Test**:
   - Open https://yourdomain.com on iPad
   - Try camera capture
   - Upload test image
   - Verify QR code generation

3. **Check Logs**:
   ```bash
   pm2 logs pilot-app
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

## 💰 Cost Comparison

| Provider | Monthly Cost | Free Tier | Setup Difficulty |
|----------|-------------|-----------|------------------|
| DigitalOcean | $6+ | No | Medium |
| Google Cloud | $10+ | 3 months | Medium |
| AWS EC2 | $10+ | 12 months | Hard |
| Heroku | $7+ | Limited | Easy |
| Railway | $5+ | $5 credit | Very Easy |
| Vercel* | $20+ | Limited | Easy |
| Netlify* | N/A | N/A | Not suitable |

*Note: Vercel/Netlify work for static sites, but need serverless functions for this app.

## 🆘 Troubleshooting

### Issue: "Camera not working on public domain"

**Solution**: Ensure you have HTTPS enabled. Camera access requires SSL.

### Issue: "502 Bad Gateway"

**Solutions**:
```bash
pm2 status  # Check if app is running
pm2 restart pilot-app
systemctl status nginx
```

### Issue: "Upload fails / File too large"

**Solution**: Increase Nginx upload limit:
```nginx
# In /etc/nginx/nginx.conf
http {
    client_max_body_size 10M;
}
```

### Issue: "Out of memory"

**Solution**: Upgrade server RAM or add swap:
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 🎯 Next Steps

1. Choose a hosting provider
2. Purchase and configure domain
3. Deploy using steps above
4. Setup SSL certificate
5. Test thoroughly on iPad
6. Add monitoring
7. Setup regular backups

## 📚 Additional Resources

- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

Need help? Check the main [README.md](README.md) or consult your hosting provider's documentation.
