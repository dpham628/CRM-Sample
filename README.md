This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Zoom CRM Demo App

## 📘 Introduction

This is a demo CRM application built to showcase how to integrate Zoom's **Phone** and **Contact Center** using **Zoom Smart Embed**, **Zoom APIs**, and **OAuth** authentication.

This application is designed as a reference project for developers building CRM tools that incorporate Zoom's communication platforms.

### 🔀 Branch Behavior

- **`main`**: Full working CRM with **hardcoded data**, an embedded Softphone using Zoom Phone, and mock Zoom behavior.
- **`phone`**: Connects to **Zoom Phone** via Smart Embed and API calls, uses real **OAuth credentials**.
- **`contact-center`**: Integrates **Zoom Contact Center**, API usage, and **OAuth credentials**

## 🧰 Tech Stack

- **Next.js** – React-based web framework
- **React** – UI library
- **TailwindCSS** – Utility-first CSS
- **Zoom Smart Embed** – Zoom Phone & Contact Center interfaces
- **Node.js API routes** – For backend token exchange and API access
- **Admin-Level OAuth App** – Authorization mechanism for Zoom

## 🚀 Running the App

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/zoom-crm-demo.git 
   *to clone a specific branch, run the command
   cd zoom-crm-demo
   ```
   *Note: To clone a specific branch, run the command `git clone --branch <branch-name> --single-branch <repo-url>` in your terminal. Otherwise, clone the entire repo and switch to the respective branch based on your product pereference*

2. Use Node.js 24 LTS (pinned in `.nvmrc` / `.node-version`; `engines.node` is `>=24.21.0`), then install dependencies:
   ```bash
   nvm install   # or: nvm use (reads .nvmrc)
   npm ci
   ```
3. Copy `.env.sample` to a `.env` file (see below for OAuth instructions). Set `NEXTAUTH_URL` to the app's base URL (e.g. `http://localhost:3000` locally, or your ngrok URL) and `NEXTAUTH_SECRET` to a random string (e.g. `openssl rand -base64 32`). On `main`, the Zoom credentials can stay as placeholders; pages don't require sign-in.
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🔑 Zoom OAuth Setup

1. Go to the [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Create an **Admin-level OAuth App**
3. Under OAuth settings, add this **redirect URI**:
   ```
   https://your-ngrok-url.ngrok-free.app/api/auth/callback/zoom
   ```
4. Copy your Client ID and Client Secret into `.env`
5. To acess the phone APIs used in this app, add the following scopes when integrating:
   ```
   phone:read:list_call_logs:admin
   phone:read:call_log:admin
   phone:read:list_external_contacts:admin
   user:read:user:admin (This scope needs to be added for you to be able to authorize your app with Oauth using NextAuth.js library)
   ```
6. To access the contact center APIs, add the following scopes when integrating:
   ```
   contact_center_contact:read:admin
   contact_center_report:read:admin
   ```
7. Save your changes
*Please note that the routes used in this app were selected for demo purposes to fulfill specific needs of a CRM. When working on your cloned repo, use whichever routes are deemed necessary*

---

## 📞 Configuring Smart Embed

This application makes use of Smart Embed for soft phone use. Both Contact Center and Phone have Smart Embed available. Follow the respective steps, based on which you are you working with, to configure the application with your account for use. 

### Phone Set up 

1. Head to the Zoom Phone Smart Embed app in the [Zoom App Marketplace](https://marketplace.zoom.us/apps/jnMbv3s2TaCBYMFz5yvzkA)
2. Add a the app for yourself, scroll down to the 'Manage' section and select 'Configure App'
3. Add the 'redirect URI' you used in the configuration of your app and save the changes (a created ngrok link, for example)
** For further explanation, see our [blog post](https://developers.zoom.us/blog/phone-smart-embed-reactapp-part1/) on the process. 

### Contact Center Set up 
1. Log in to your profile at zoom.us/myhome and head to the "Contact Center Management" tab on the left menu
2. Scroll to integrations, and create a new one for your application. Here, you'll add in the home URL of the app where Smart Embed we'll be used (a created ngrok link, for example)
3. Back in your "Contact Center Management" menu, select the user whose credentials are being used within the app, and under 'Client Integration', add the previously created integration
 
---

## 🔄 Branch Features Overview

| Branch           | Features                                                                 |
|------------------|--------------------------------------------------------------------------|
| `main`           | Fully working UI using hardcoded CRM data & **Zoom Phone** Smartphone    |
| `phone`          | Zoom Phone integration with Smart Embed and real API credentials         |
| `contact-center` | Zoom Contact Center with Smart Embed, and real API credentials           |

---

## 🗂️ Project Structure

```
/src
  /app             → App Router pages and globals.css (Tailwind)
    /api           → API route handlers for NextAuth and Zoom integration
  /components      → Reusable React components (e.g., Sidebar, SmartEmbed)
  /context         → React context providers (auth, calls)
.env               → Environment config for OAuth
```

---

## 🔒 Security Notice

This is a **demo application** meant for learning and reference purposes. Never expose secrets in public repositories. Use secure storage for sensitive values in production deployments.

---

## 📄 License

This project is licensed under the **MIT License**.

Use of this sample app is subject to our [Terms of Use.](https://www.zoom.com/en/trust/legal/zoom-api-license-and-tou/#:~:text=You%20agree%20not%20to%20use,of%20Zoom's%20services%20or%20software%3B)