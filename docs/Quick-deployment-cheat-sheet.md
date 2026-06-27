## Quick deployment cheat sheet

### 🟢 Frontend change only

```bash
git pull
cd pixelpi-frontend
npm install        # only if package.json changed
npm run build
sudo rsync -a --delete dist/ /var/www/pixelpi/dist/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 🟢 Backend change only

```bash
git pull
cd server
npm install        # only if package.json changed
pm2 restart pixelpi-backend
```

---

### 🟢 Nginx config change

```bash
sudo nano /etc/nginx/sites-available/pixelpi

sudo nginx -t
sudo systemctl reload nginx
```

---

### 🟢 `.env` change

If you change the backend `.env`, Express needs to reload to pick up the new environment variables:

```bash
pm2 restart pixelpi-backend
```

If you change frontend environment variables (like `.env.production`), you must:

```bash
npm run build
sudo rsync -a --delete dist/ /var/www/pixelpi/dist/
```

because Vite embeds those values at build time.