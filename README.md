# 🌟 Utopia ERP System (AI-Driven)

## 🧩 System Modules

* 🔐 Central Login (Google Auth)
* 📊 Indoor Sales Dashboard (Looker Studio Embed)
* 💬 WhatsApp Notification
* 📝 Incident Report & HR Claims (Form Submission)
* 🏠 Order & Booking

---

## 🚀 Tech Stack

* React (Frontend)
* Firebase Hosting + Firebase Auth
* Google Sheets + Apps Script (Backend Logic)
* Looker Studio (Data Visualization)
* n8n

---

## 🧭 System Direction

| Tool / Platform               | Purpose                                       |
| ----------------------------- | --------------------------------------------- |
| **React**                     | Build modern, responsive web pages            |
| **Firebase Hosting**          | Deploy & host the system online               |
| **Firebase Authentication**   | Enable secure Google login for internal users |
| **Firestore / Google Sheets** | Store user info, roles, and system data       |
| **Firebase CLI**              | One-line deployment to Firebase               |
| **Git + GitHub**              | Version control & team collaboration          |

## 🛠️ Future Plan

* 🧩 Add Operation, After-Sales, and Refund modules into main system
* 🔄 Integrate n8n for workflow automation
* 🔐 Role-based permission with Firestore
* 📦 Modularize Chat System / Form Tools
* 🔄 Integrate n8n for workflow automation
* 🔐 Role-based permission with Firestore
* 📦 Modularize Chat System / Form Tools

---

## 🔧 Local Development

```bash
npm install     # Install all required packages
npm run dev     # Start local development server (localhost:5173)
npm run build   # Build project for deployment (creates /dist folder)
```

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

## 👥 Team Rules

* Use `dev` to test features before going live.
* Only deploy to `default` when everything is tested and approved.
* Use Git to track code changes and commits.
* Keep this README updated with any changes to deploy flow.

---

✅ All team members should deploy to dev for testing. Once approved, deploy to production. 🚀
