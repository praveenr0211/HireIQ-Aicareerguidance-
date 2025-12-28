# PostgreSQL Deployment Guide

## The Problem

SQLite is a file-based database that **doesn't work** in cloud deployments because:

- ✗ File systems are ephemeral (reset on every restart)
- ✗ No persistent storage across containers
- ✗ Data gets deleted when your app restarts

## The Solution: PostgreSQL Migration ✅

Your app has been **migrated to PostgreSQL** - a proper production database!

---

## 🚀 Deployment Steps

### 1. Install Dependencies Locally (for testing)

```bash
cd backend
npm install
```

This will install the new `pg` package (PostgreSQL driver) instead of `sqlite3`.

### 2. Set Up PostgreSQL Database

#### Option A: Deploy on Render (Recommended - Free Tier)

1. **Sign up at [render.com](https://render.com)**

2. **Create a PostgreSQL Database:**

   - Click "New +" → "PostgreSQL"
   - Name: `skillgap-db` (or any name)
   - Free tier is perfect for testing
   - Click "Create Database"
   - **Copy the "External Database URL"** (starts with `postgresql://`)

3. **Create a Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: `skillgap-analyzer`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add Environment Variables:**

   ```
   DATABASE_URL=<paste your PostgreSQL external URL>
   GEMINI_API_KEY=<your-gemini-api-key>
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/auth/google/callback
   SESSION_SECRET=<generate-a-random-secret-key>
   ```

5. **Deploy and Initialize Database:**
   Once deployed, open Render Shell and run:
   ```bash
   npm run init-db
   node initHistoryTable.js
   node initProgressTable.js
   ```

#### Option B: Deploy on Heroku

1. **Install Heroku CLI** and login:

   ```bash
   heroku login
   ```

2. **Create Heroku app:**

   ```bash
   cd backend
   heroku create skillgap-analyzer
   ```

3. **Add PostgreSQL addon (FREE tier):**

   ```bash
   heroku addons:create heroku-postgresql:essential-0
   ```

   This automatically sets `DATABASE_URL` environment variable!

4. **Set other environment variables:**

   ```bash
   heroku config:set GEMINI_API_KEY=AIzaSyBvr2dnFoL3rnYR9XuKmLX1t5E9vefMLA4
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
   heroku config:set SESSION_SECRET=mysupersecretkey12345randomstring
   ```

5. **Deploy:**

   ```bash
   git push heroku main
   ```

6. **Initialize database:**
   ```bash
   heroku run npm run init-db
   heroku run node initHistoryTable.js
   heroku run node initProgressTable.js
   ```

### 3. Deploy Frontend (Vercel/Netlify)

Update frontend API URL to point to your deployed backend:

**frontend/src/services/api.js:**

```javascript
const API_URL =
  process.env.REACT_APP_API_URL || "https://your-backend.onrender.com";
```

Add environment variable in Vercel/Netlify:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### 4. Update Google OAuth Callback

In [Google Cloud Console](https://console.cloud.google.com/):

- Go to APIs & Services → Credentials
- Add authorized redirect URI:
  ```
  https://your-backend-url.onrender.com/auth/google/callback
  ```

---

## 🧪 Testing Locally with PostgreSQL

1. **Install PostgreSQL locally:**

   - **Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **Mac:** `brew install postgresql`
   - **Linux:** `sudo apt-get install postgresql`

2. **Create local database:**

   ```bash
   createdb skillgap
   ```

3. **Update .env file:**

   ```env
   DATABASE_URL=postgresql://localhost:5432/skillgap
   ```

   (Or with credentials: `postgresql://username:password@localhost:5432/skillgap`)

4. **Initialize database:**

   ```bash
   cd backend
   npm run init-db
   node initHistoryTable.js
   node initProgressTable.js
   ```

5. **Start server:**
   ```bash
   npm start
   ```

---

## 📋 What Changed in the Code

### ✅ Package.json

- Removed: `sqlite3`
- Added: `pg` (PostgreSQL driver)

### ✅ Database Configuration

- **Before (SQLite):** File-based connection
- **After (PostgreSQL):** Connection pool with DATABASE_URL

### ✅ Query Syntax Changes

- **Placeholders:** `?` → `$1, $2, $3` (PostgreSQL parameterized queries)
- **AUTO_INCREMENT:** `AUTOINCREMENT` → `SERIAL`
- **DATETIME:** `DATETIME` → `TIMESTAMP`
- **INSERT OR IGNORE:** → `ON CONFLICT DO NOTHING`
- **Async/Await:** Converted all callbacks to promises

### ✅ Files Modified

1. `backend/package.json`
2. `backend/config/database.js`
3. `backend/initDatabase.js`
4. `backend/initHistoryTable.js`
5. `backend/initProgressTable.js`
6. `backend/controllers/analyzeController.js`
7. `backend/controllers/historyController.js`
8. `backend/controllers/progressController.js`

---

## 🔍 Troubleshooting

### Error: "relation does not exist"

**Solution:** Run database initialization scripts:

```bash
npm run init-db
node initHistoryTable.js
node initProgressTable.js
```

### Error: "connection refused"

**Solution:** Check `DATABASE_URL` is correctly set in environment variables.

### Error: "SSL connection required"

**Solution:** Already handled! The code automatically enables SSL in production.

### Still getting 500 errors?

**Check backend logs:**

- Render: Dashboard → Logs
- Heroku: `heroku logs --tail`

---

## 🎉 Benefits of PostgreSQL

✅ **Persistent data** - Data survives restarts  
✅ **Production-ready** - Used by major companies  
✅ **Free tier available** - Render, Heroku, Supabase  
✅ **Better performance** - Handles concurrent users  
✅ **ACID compliance** - Data integrity guaranteed

---

## Next Steps

1. ✅ Code is already migrated to PostgreSQL
2. 📦 Install dependencies: `npm install`
3. 🗄️ Set up PostgreSQL database (Render/Heroku)
4. 🚀 Deploy backend with DATABASE_URL
5. 🌐 Update frontend to use deployed backend URL
6. 🎯 Initialize database tables
7. ✅ Test resume upload!
