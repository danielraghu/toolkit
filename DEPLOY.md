# 🚀 ToolKit Deployment Guide

Deploy your ToolKit app to **Vercel**, **Render**, or **cPanel**.

---

## ⚠️ Important: Database Decision

Your app currently uses **SQLite** (file-based). This works great for local dev and traditional servers, but **does NOT work on Vercel** (serverless, ephemeral filesystem).

| Platform | SQLite | PostgreSQL | Recommendation |
|----------|--------|------------|----------------|
| cPanel   | ✅ Yes | ✅ Yes     | SQLite (simplest) |
| Render   | ⚠️ Disk needed | ✅ Built-in free | PostgreSQL (recommended) |
| Vercel   | ❌ No  | ✅ Yes     | PostgreSQL (required) |

### To switch to PostgreSQL:
```bash
# 1. Copy the PostgreSQL schema
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# 2. Update your .env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# 3. Push schema & seed
npx prisma db push
npx tsx seed.ts
```

---

## 🟢 Option 1: Vercel (Easiest, Free Tier Available)

### Prerequisites
- GitHub account
- A PostgreSQL database (see options below)

### Free PostgreSQL Options for Vercel:
- **[Neon](https://neon.tech)** — Free tier, serverless Postgres (recommended)
- **[Supabase](https://supabase.com)** — Free tier, 500MB
- **[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)** — Built-in, free 256MB

### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/toolkit.git
   git push -u origin main
   ```

2. **Switch to PostgreSQL** (see above)
   ```bash
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   ```

3. **Create a Neon database** (free):
   - Go to [neon.tech](https://neon.tech) → Sign up → Create project
   - Copy the connection string

4. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) → Import your GitHub repo
   - Set environment variable:
     ```
     DATABASE_URL = postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
     ```
   - Click **Deploy**

5. **Seed the database** after first deploy:
   - Go to Vercel → Settings → Environment Variables
   - Add: `SKIP_SEED_CHECK = true` (not needed, seed auto-runs)
   - In your local terminal with the production DATABASE_URL:
     ```bash
     DATABASE_URL="your-production-url" npx tsx seed.ts
     ```

### Vercel-Specific Notes:
- Your `vercel.json` is already configured
- Prisma generates automatically via `postinstall` in `package.json`
- The app auto-detects Vercel's Node.js environment

---

## 🟡 Option 2: Render (Free Tier Available)

### Prerequisites
- GitHub account

### Steps:

1. **Push code to GitHub** (same as Vercel step 1)

2. **Deploy via Dashboard** (recommended):
   - Go to [render.com](https://render.com) → New → Web Service
   - Connect your GitHub repo
   - Configure:
     - **Build Command**: `npm run build`
     - **Start Command**: `npm start`
     - **Environment**: `NODE_ENV = production`
   - Add a **PostgreSQL** database:
     - New → PostgreSQL → Free plan
     - Copy the internal connection string
   - Set environment variable on your web service:
     ```
     DATABASE_URL = postgresql://render_user:xxx@xxx.a.letterdb.com/render_db
     ```
   - Deploy!

3. **Or use `render.yaml`** (auto-detected):
   - Your repo already includes `render.yaml`
   - Render will auto-create the web service + Postgres database
   - Just connect your GitHub repo and it deploys automatically

4. **Seed the database**:
   - Go to Render → Shell (in your web service)
   - Run: `npx tsx seed.ts`

### Render-Specific Notes:
- Free web services **spin down after 15 min** of inactivity (cold start ~30s)
- Free PostgreSQL includes 90MB storage
- Persistent disk is available on paid plans
- Auto-deploys on every push to `main`

### Alternative: Keep SQLite on Render (with persistent disk):
- Add a persistent disk in Render dashboard
- Mount path: `/opt/render/project/src/db`
- Keep your current SQLite schema
- Set: `DATABASE_URL = "file:/opt/render/project/src/db/custom.db"`
- *Note: Persistent disks are paid feature ($0.10/GB/month)*

---

## 🔴 Option 3: cPanel (Traditional Hosting)

### Prerequisites
- cPanel with **Node.js** support (Setup Node.js App)
- SSH access (recommended)

### Option A: Using cPanel's Node.js Manager

1. **Build locally**:
   ```bash
   npm run build:standalone
   ```

2. **Upload files to cPanel**:
   - Upload these files/folders via File Manager or SFTP:
     ```
     .next/standalone/     → your app directory
     .next/static/         → .next/standalone/.next/static/
     public/               → .next/standalone/public/
     prisma/               → your app directory/prisma/
     db/custom.db          → your app directory/db/custom.db
     node_modules/         → your app directory/node_modules/
     package.json          → your app directory/package.json
   ```

3. **Configure in cPanel**:
   - Go to **cPanel → Software → Setup Node.js App**
   - Create application:
     - **Node.js version**: 18+ or 20+
     - **Application mode**: Production
     - **Application root**: `/home/youruser/toolkit`
     - **Application URL**: `yourdomain.com`
     - **Application startup file**: `.next/standalone/server.js`
   - Click **Create**

4. **Set environment variables** in cPanel:
   ```
   NODE_ENV = production
   DATABASE_URL = file:./db/custom.db
   PORT = 3000  (or whatever cPanel assigns)
   ```

5. **Run Prisma commands** via cPanel Terminal or SSH:
   ```bash
   cd ~/toolkit
   npx prisma generate
   npx prisma db push
   npx tsx seed.ts
   ```

6. **Restart the app** via cPanel Node.js manager → Restart

### Option B: Using SSH (more control)

```bash
# SSH into your server
ssh youruser@yourserver.com

# Clone your repo
cd ~
git clone https://github.com/YOUR_USERNAME/toolkit.git
cd toolkit

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed the database
npx tsx seed.ts

# Build for production
npm run build

# Start the app (use PM2 for process management)
npm install -g pm2
pm2 start .next/standalone/server.js --name toolkit
pm2 save
pm2 startup
```

### cPanel-Specific Notes:
- SQLite works perfectly (persistent filesystem)
- Make sure your cPanel has Node.js 18+ installed
- Use PM2 or cPanel's built-in process manager
- Set up a reverse proxy in cPanel if needed (Apache/Nginx)
- If your cPanel doesn't have Node.js support, ask your host to enable it

---

## 📁 Files Added for Deployment

| File | Purpose |
|------|---------|
| `render.yaml` | Auto-config for Render deployment |
| `vercel.json` | Vercel build configuration |
| `.env.example` | Environment variable template |
| `.dockerignore` | For Docker-based deployments |
| `prisma/schema.postgresql.prisma` | PostgreSQL schema variant |

## 🔧 Troubleshooting

### "prisma generate" fails
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

### Database connection error on Vercel/Render
- Ensure `DATABASE_URL` includes `?sslmode=require` for cloud Postgres
- Check that the database IP is allowed (Neon/Supabase may have allowlists)

### Build fails with "Cannot find module"
```bash
rm -rf node_modules .next
npm install
npm run build
```

### cPanel: Port already in use
- cPanel's Node.js manager auto-assigns ports. Check the assigned port in the UI.
- Update the PORT env variable to match.

---

## 📊 Quick Comparison

| | Vercel | Render | cPanel |
|--|--------|--------|--------|
| Cost | Free tier ✅ | Free tier ✅ | Paid hosting |
| Setup | 5 min | 5 min | 15-30 min |
| Auto-deploy | Git push ✅ | Git push ✅ | Manual |
| Cold starts | Serverless ⚡ | Free tier only | None |
| SSL | Auto ✅ | Auto ✅ | Auto/Manual |
| Custom domain | ✅ | ✅ | ✅ |
| SQLite support | ❌ | With disk | ✅ |
| Best for | Quick launch | Full control | Existing hosting |