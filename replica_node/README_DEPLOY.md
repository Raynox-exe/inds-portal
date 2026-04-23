# 🚀 Deployment Guide for INDS Portal

This guide explains how to deploy the INDS Node.js application to a free/affordable hosting provider.

## 🌟 Top Hosting Recommendations

### 1. Render (Recommended)
*   **Plan**: Free Web Service
*   **Pros**: Easiest setup, handles SSL automatically, reliable.
*   **Cons**: Free tier "sleeps" after 15 mins of inactivity (first request takes 30s to wake up).

### 2. Railway
*   **Plan**: Usage-based (Free trial credits)
*   **Pros**: Supports Node.js + MySQL in the same project, very fast deployment.
*   **Cons**: Requires a small payment method for verification after trial.

### 3. Aiven (For Database)
*   **Service**: Free MySQL
*   **Use case**: Use this if your web host (like Render) doesn't provide a free MySQL database.

---

## 🛠️ Preparation Steps

1.  **Initialize Git**:
    ```bash
    git init
    git add .
    git commit -m "Prepare for deployment"
    ```

2.  **Environment Variables**:
    When you deploy, you MUST set these variables in the hosting provider's dashboard:
    *   `PORT`: 3000
    *   `DB_HOST`: Your database host address
    *   `DB_USER`: Your database username
    *   `DB_PASS`: Your database password
    *   `DB_NAME`: Your database name
    *   `SESSION_SECRET`: A long random string (e.g., `inds_prod_secret_2026`)
    *   `ALLOWED_ORIGINS`: Your production URL (e.g., `https://inds-portal.onrender.com`)

3.  **Database Migration**:
    *   Export your local database to a `.sql` file.
    *   Import it into your online database (Aiven or Railway).
    *   Run `node migrate_db.js` if you are starting fresh.

## 📋 Deployment via Render (Step-by-Step)
1.  Push your code to **GitHub**.
2.  Login to [Render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  Set **Build Command**: `npm install`
6.  Set **Start Command**: `npm start`
7.  Click **Advanced** -> **Add Environment Variable** (Add the variables listed above).
8.  Click **Deploy**.

---

## 🔒 Security Reminders
*   Never commit your `.env` file (it is already in `.gitignore`).
*   Ensure your `SESSION_SECRET` is strong.
*   The `uploads/` folders are currently ignored. You may need to use an external storage like **Cloudinary** if you want uploaded manuscripts to persist across redeployments on Render's free tier (since its filesystem is temporary).
