# PixelPi Deployment Guide

**Version:** Current JSON-backed deployment
**Repository:** https://github.com/Ash-the-k/PixelPi

> The project is currently hosted under my personal GitHub account. Once development stabilizes, the repository can be migrated to the company's GitHub organization without affecting deployment.

---

## Table of Contents

1. [Overview](#overview)
2. [Repository Structure](#repository-structure)
3. [Before You Start](#before-you-start)
4. [Runtime Files (Not in Git)](#runtime-files-not-in-git)
5. [Initial Server Setup](#initial-server-setup)
   - [Clone Repository](#clone-repository)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
6. [Deploy React Build](#deploy-react-build)
7. [Configure Nginx](#configure-nginx)
8. [Start Backend with PM2](#start-backend-with-pm2)
9. [Verification Checklist](#verification-checklist)
10. [Current Data](#current-data)
11. [Legacy Admin (Temporary)](#legacy-admin-temporary)
12. [Updating the Website](#updating-the-website)
13. [Reference: PM2 Commands](#reference-pm2-commands)
14. [Reference: Nginx Commands](#reference-nginx-commands)
15. [Troubleshooting](#troubleshooting)
16. [Future Roadmap](#future-roadmap)
17. [Notes](#notes)

---

## Overview

This document describes the complete deployment process for the current PixelPi website.

**Current architecture:**

```text
Browser
    │
    ▼
Nginx
    │
    ├── Serves React Production Build
    │
    ├── /api      → Express Backend
    └── /uploads  → Express Backend
                      │
                      ▼
                  PM2 (Node.js)
                      │
                      ▼
          JSON Fallback Storage (Current)
```

> **Important:** The current deployment **does not use MySQL or MongoDB**. The backend uses JSON files stored in `pixelpi-backend/data/`. MongoDB migration is planned for a future version.

---

## Repository Structure

```
PixelPi/
├── README.md
├── docs/
├── pixelpi-frontend/
├── pixelpi-backend/
│   ├── server/
│   ├── uploads/
│   ├── data/
│   ├── public/
│   └── scratch/
└── temp/
```

---

## Before You Start

Check if the following are already installed on the server. **Skip installation for anything already present.**

| Tool | Check command |
|------|--------------|
| Git | `git --version` |
| Node.js | `node -v` |
| npm | `npm -v` |
| Nginx | `nginx -v` |
| PM2 | `pm2 -v` |

---

## Runtime Files (Not in Git)

The following are intentionally excluded from version control and **must be copied manually after cloning.**

| Path | Reason |
|------|--------|
| `pixelpi-backend/server/.env` | Contains secrets |
| `pixelpi-backend/data/` | JSON datastore |
| `pixelpi-backend/uploads/` | Runtime-generated files |

---

## Initial Server Setup

### Clone Repository

```bash
git clone https://github.com/Ash-the-k/PixelPi.git
cd PixelPi
```

### Backend Setup

```bash
cd pixelpi-backend/server
npm install
```

Then copy the runtime files that are excluded from Git:

- `data/` → `pixelpi-backend/data/`
- `uploads/` → `pixelpi-backend/uploads/`
- `.env` → `pixelpi-backend/server/.env`

### Frontend Setup

```bash
cd pixelpi-frontend
npm install
npm run build
```

This generates the production build at `pixelpi-frontend/dist/`.

---

## Deploy React Build

Create the deployment directory (only once):

```bash
sudo mkdir -p /var/www/pixelpi
```

Copy the build:

```bash
sudo rsync -a --delete dist/ /var/www/pixelpi/dist/
```

---

## Configure Nginx

> **Note:** This configuration assumes HTTPS is already configured via Certbot (Let's Encrypt). If the server is already serving `https://pixelpitechnologies.in`, keep existing SSL certificate paths and replace only the server block below. If HTTPS is not yet configured, generate SSL certificates with Certbot before proceeding.

### Step 1 — Verify Existing SSL Certificate

```bash
sudo ls /etc/letsencrypt/live/
```

Expected output:

```text
pixelpitechnologies.in
```

If the directory name differs (e.g. `pixelpitechnologies.in-0001`), update the `ssl_certificate` paths in the config below to match. If the site is already accessible over HTTPS, the paths are usually already correct.

### Step 2 — Write the Nginx Config

Open or create the site configuration:

```bash
sudo nano /etc/nginx/sites-available/pixelpi
```

Paste the following:

```nginx
server {
    listen 80;
    server_name pixelpitechnologies.in www.pixelpitechnologies.in;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pixelpitechnologies.in www.pixelpitechnologies.in;

    # Keep existing SSL paths if they differ.
    ssl_certificate /etc/letsencrypt/live/pixelpitechnologies.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pixelpitechnologies.in/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # =========================
    # React Production Build
    # =========================
    root /var/www/pixelpi/dist;
    index index.html;

    # =========================
    # API -> Express Backend
    # =========================
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        client_max_body_size 10M;
    }

    # =========================
    # User Uploaded Files
    # =========================
    location ^~ /uploads/ {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # =========================
    # React SPA Routing
    # =========================
    location / {
        try_files $uri $uri/ /index.html;
    }

    # =========================
    # Cache Static Frontend Assets
    # =========================
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 3 — Enable and Activate

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/pixelpi /etc/nginx/sites-enabled/
```

Disable the default site **if required**:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Test, then reload — **never reload without testing first:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Start Backend with PM2

### Clean Up Old PM2 Processes (If Applicable)

If the server is already running PM2 processes from a previous deployment, remove them first. **Do not remove processes belonging to unrelated applications.**

```bash
pm2 list
pm2 delete <process-name>
pm2 list   # verify
```

### Start the Backend

```bash
cd pixelpi-backend/server
pm2 start server.js --name pixelpi-backend
```

### Enable Startup on Reboot

```bash
pm2 startup
```

This prints a command in your terminal — **copy and run that output directly, not the example below:**

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u <username> --hp /home/<username>
```

Copy and run that exact command — it varies by server. Then save the process list:

```bash
pm2 save
```

---

## Verification Checklist

After deployment, verify each of the following:

- [ ] Home page loads
- [ ] API requests work
- [ ] Forms submit successfully
- [ ] Images load correctly
- [ ] Page refresh works on all routes (SPA routing)
- [ ] Backend is running (`pm2 list`)
- [ ] Nginx is serving the React build

---

## Current Data

The provided JSON files contain placeholder/demo content. Before going public, replace:

- Blog posts
- Gallery metadata
- Career openings
- Company information

**Recommended workflow:**

1. Deploy locally or on the server
2. Review all placeholder content
3. Replace before making the deployment public

---

## Legacy Admin (Temporary)

A new React Admin Dashboard is currently under development. Until it is completed, the legacy Express admin is still available.

**Do not expose port 3000 publicly.** Access it securely via SSH port forwarding:

```bash
ssh -L 3000:localhost:3000 username@server-ip
```

Then open in your browser:

```
http://localhost:3000/admin
```

This tunnels the server's admin interface to your local machine without exposing it to the internet.

---

## Updating the Website

### Backend Code Changed

```bash
git pull
cd pixelpi-backend/server
npm install        # only if package.json or package-lock.json changed
pm2 restart pixelpi-backend
```

### Frontend Code Changed

```bash
git pull
cd pixelpi-frontend
npm install        # only if package.json changed
npm run build
sudo rsync -a --delete dist/ /var/www/pixelpi/dist/
```

### Nginx Config Changed

```bash
sudo nginx -t
sudo systemctl reload nginx    # only if test passes
```

---

## Reference: PM2 Commands

| Action | Command |
|--------|---------|
| View processes | `pm2 list` |
| Restart backend | `pm2 restart pixelpi-backend` |
| View logs | `pm2 logs pixelpi-backend` |
| Save process list | `pm2 save` |

> `pm2 save` is only needed after changing the PM2 process configuration (adding, removing, or renaming processes). It is **not** required after a routine `pm2 restart`.

---

## Reference: Nginx Commands

| Action | Command |
|--------|---------|
| Test configuration | `sudo nginx -t` |
| Reload | `sudo systemctl reload nginx` |
| Restart | `sudo systemctl restart nginx` |
| Status | `systemctl status nginx` |

---

## Troubleshooting

### Images return 404

Verify that `pixelpi-backend/uploads/` exists and contains the uploaded files.

### API not responding

```bash
pm2 list
pm2 logs pixelpi-backend
```

### Frontend changes not visible

```bash
npm run build
sudo rsync -a --delete dist/ /var/www/pixelpi/dist/
```

### Backend changes not visible

```bash
pm2 restart pixelpi-backend
```

### Nginx configuration errors

Never reload immediately. Always test first:

```bash
sudo nginx -t
```

Fix any reported errors before reloading.

### CORS errors

Ensure the backend `.env` contains the correct production origins:

```
https://pixelpitechnologies.in
https://www.pixelpitechnologies.in
http://localhost:3000
```

> The `localhost` origin is required temporarily for the legacy admin when accessed via SSH port forwarding.

---

## Future Roadmap

- React Admin Dashboard
- MongoDB migration
- Repository migration to the company GitHub organization
- Removal of the legacy Express admin

---

## Notes

This deployment guide reflects the current production-tested architecture, validated on a clean Ubuntu VM using Node.js, Express, React (Vite), Nginx, and PM2 before deployment to the production server.

---

*DEPLOYMENT_GUIDE.md — v1.0*
*Architecture: Nginx + PM2 + Express (JSON-backed) + React (Vite)*
*Validated on: Clean Ubuntu VM before production deployment*
*v1.0: Initial deployment guide. JSON-backed architecture. Legacy admin via SSH port forwarding.*