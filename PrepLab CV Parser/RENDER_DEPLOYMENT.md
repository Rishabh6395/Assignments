# Deploying PrepLab Resume Customizer to Render

This repository is pre-configured for **Render** using both **Render Blueprints (`render.yaml`)** and **Manual Web Service** deployment.

---

## ⚡ Option 1: Automatic 1-Click Deployment (Render Blueprint)

1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top-right corner and select **Blueprint**.
3. Connect your GitHub repository: `Rishabh6395/Assignments`.
4. Render will detect `render.yaml` and configure both services automatically:
   - `preplab-cv-backend` (Node Web Service)
   - `preplab-cv-frontend` (Next.js Web Service)
5. (Optional) Provide your `GEMINI_API_KEY` when prompted in the environment variables screen (or leave it blank to use the smart demo engine, or input it later in the UI).
6. Click **Apply**.
7. Render will build and deploy both services!

---

## 🛠️ Option 2: Manual Web Service Setup (Step-by-Step)

If you prefer setting up the services manually in Render:

### Step 1: Deploy Backend Web Service
1. In Render Dashboard, click **New +** → **Web Service**.
2. Select your repository: `Rishabh6395/Assignments`.
3. Configure the following fields:
   - **Name**: `preplab-cv-backend`
   - **Region**: Any (e.g. Oregon or Frankfurt)
   - **Branch**: `master`
   - **Root Directory**: `PrepLab CV Parser/backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   - `PORT`: `5000` *(Render sets this automatically, but you can specify 5000)*
   - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini API key)*
5. Click **Deploy Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://preplab-cv-backend.onrender.com`).

---

### Step 2: Deploy Frontend Web Service
1. In Render Dashboard, click **New +** → **Web Service**.
2. Select the same repository: `Rishabh6395/Assignments`.
3. Configure the following fields:
   - **Name**: `preplab-cv-frontend`
   - **Region**: Same region as backend
   - **Branch**: `master`
   - **Root Directory**: `PrepLab CV Parser/frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://preplab-cv-backend.onrender.com/api` *(replace with your actual backend URL from Step 1)*
   - `NODE_VERSION`: `20.18.0`
5. Click **Deploy Web Service**.
6. Once deployed, open your frontend live link (e.g., `https://preplab-cv-frontend.onrender.com`)!

---

## 💡 Notes on Render Free Tier
- **Spin-down**: Free Render Web Services spin down after 15 minutes of inactivity. When a new request arrives, it may take ~30–50 seconds to wake up.
- **API Keys**: Users can enter their API key directly in the web app via **LLM Settings** (top-right button), or you can bake it into the Render backend environment variables.
