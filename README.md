# 🌟 Utopia ERP System – Modern AI-Driven Web Platform (IN PLANNING)

A full-featured, modular ERP system for internal use across sales, operations, and HR.  
Built with Supabase + Firebase, integrated with workflow automation, AI assist, and modular dashboards.

---

## 🧩 System Modules

- 🔐 Login with Supabase Auth (email whitelisting)
- 📊 KPI Dashboard
- 💬 WhatsApp Notification System
- 📝 Incident Report & HR Claim Forms
- 🏠 Rental Order, Booking & Collection Flow
- 📦 Refund, After-Sales, Technician or Driver Assignment
---

## 🚀 Tech Stack Overview

| Stack                    | Purpose                                 |
|--------------            |---------------------------------------- |
| **React + Vite**         | Modern frontend framework               |
| **Supabase (Postgres)**  | Main database (role-based access)       |
| **Firebase Firestore**   | Real-time store (e.g., Chat, Status)    |
| **Supabase Auth**        | Email login with RLS-permission system  |
| **Firebase Hosting**     | Dual-env deployment (staging / prod)    |
| **n8n**                  | Workflow automation (e.g., reminders)   |
| **Metabase / Recharts**  | Dashboard & KPI Visualization           |

---

## 🧱 System Architecture

```txt
[Supabase (Auth + DB + Storage)]
        |
        |── RLS Roles: admin / sales / ops / manager
        |
        └── Supabase Edge Functions (API Layer)

[Firebase Firestore]
        └── Real-time: chat logs, job status, feedback sync

[n8n]
        └── Scheduler + Notification (Telegram / WhatsApp / Email)

[React + Vite Frontend]
        └── Connected via Supabase JS SDK + Firestore SDK

---

## 🗂️ Project Structure 

utopia-erp/
├── src/               # React app
├── public/            # Static assets
├── .env               # Environment config
├── dist/              # Built output
├── firebase.json      # Hosting config
├── .firebaserc        # Target mapping (staging/production)
└── supabase/          # SQL, RLS, function scripts

---

## ⚙️ Prerequisites
Node.js >= 18
npm >= 9
Firebase CLI: npm install -g firebase-tools
Supabase CLI (optional): npm install -g supabase

---

## 🔐 Auth Setup
✅ Login via Supabase email/password
✅ Only pre-registered emails can access
✅ RLS (Row Level Security) ensures role-based access
🔐 No longer using Firebase Auth

---

## ⚙️ Local Development

# Install dependencies
npm install

# Start dev server
npm run dev
Access via: http://localhost:3000

---

## 📁 Environment Variables (.env)

VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
VITE_FIREBASE_API_KEY=xxxxx (if hybrid)
VITE_ENV=staging
VITE_API_BASE=https://api.staging.utopia.com

.env.production & .env.staging are ignored in Git
Set correct VITE_ENV when building for different environments.

---

## 📦 Build & Deploy
🔨 Build
vite build --mode staging
vite build --mode production

🔼 Firebase Hosting Deploy
firebase deploy --only hosting:staging
firebase deploy --only hosting:production
Hosting targets are defined in firebase.json and .firebaserc

---

## 📊 Dashboard
Metabase - Self-hosted, supports Supabase SQL
Recharts - For real-time internal graphs

---

## 🧪 Future CI/CD 
GitHub Actions
- develop branch → auto deploy to staging
- main tag/release → deploy to production
- Supabase + Firebase token injection via .env secrets
- Code linting & auto-preview generation

---

## 📦 Deployment Commands

```bash
# Build project
npm run build

# Deploy to development environment
firebase deploy --only hosting:dev

# Deploy to production (default)
firebase deploy
```

---

## 🧭 Firebase Hosting Configuration

```json
{
  "hosting": [
    {
      "target": "dev",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ]
    },
    {
      "target": "default",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ]
    }
  ]
}
```

---

## 👥 Team Instructions
All modules must be tested in staging before pushing to production
Git commit messages follow feat: / fix: / refactor: / chore: convention
Only admins have production deploy permission
Keep README updated if any new module or logic is added

---
