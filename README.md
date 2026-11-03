<div align="center">
  <br />
  <h1>🎟️ Ticketing System Frontend</h1>
  <p><strong>Modern, High-Performance Event Booking & E-Ticketing Web Client</strong></p>
  <p><em>Built with React 19, Vite 8, Tailwind CSS 4, and React Router 8.</em></p>

  <p>
    <a href="https://github.com/ticketing-system-platform/ticketing-system-frontend/actions"><img src="https://img.shields.io/github/actions/workflow/status/ticketing-system-platform/ticketing-system-frontend/ci.yml?branch=main&style=flat-square&logo=github-actions&label=CI%20Build" alt="CI Status" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/Framework-React%2019-61DAFB?style=flat-square&logo=react" alt="React 19" /></a>
    <a href="https://vite.dev"><img src="https://img.shields.io/badge/Bundler-Vite%208-646CFF?style=flat-square&logo=vite" alt="Vite 8" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Styles-Tailwind%20CSS%204-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS 4" /></a>
    <a href="https://reactrouter.com"><img src="https://img.shields.io/badge/Routing-React%20Router%208-CA4245?style=flat-square&logo=react-router" alt="React Router 8" /></a>
    <a href="https://axios-http.com"><img src="https://img.shields.io/badge/HTTP-Axios-5A29E4?style=flat-square&logo=axios" alt="Axios" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" /></a>
  </p>
  <br />
</div>

---

## ⚡ Overview

**Ticketing System Frontend** is the user-facing web interface for the Ticketing System platform. Designed for fast, responsive booking experiences across desktop and mobile, it connects directly to the [Backend API](https://github.com/ticketing-system-platform/backend-ticketing-system).

---

## ✨ Key Features

- **🎪 Event Discovery & Catalog**: Explore active events, concerts, seminars, and exhibitions with banner previews, date filtering, and venue information.
- **🏷️ Dynamic Ticket Tier Breakdown**: View available ticket categories (e.g. VIP, Early Bird, Regular), real-time remaining quotas, and pricing.
- **💳 Integrated Checkout & Payments**: Seamless checkout flow ready for Midtrans Snap payment gateway.
- **🔐 Sanctum Authentication Flow**: JWT/Token-based session management (`AuthContext`) with customer login, registration, and protected routes.
- **📱 Fully Responsive Modern UI**: Crafted with Tailwind CSS 4 and Lucide React icons for a clean, accessible booking experience.

---

## 🏗️ UI Architecture & Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── Alert.jsx        # Contextual notifications & flash alerts
│   ├── AuthCard.jsx     # Card wrapper for login & registration
│   ├── EmptyState.jsx   # Friendly empty / no-data placeholders
│   ├── EventCard.jsx    # Event grid display card with pricing & tags
│   ├── Loading.jsx      # Animated spinners & skeleton states
│   ├── Navbar.jsx       # Global responsive navigation header
│   ├── PageHeader.jsx   # Uniform page title & breadcrumbs
│   └── StatusBadge.jsx  # Event & ticket status indicator pills
├── context/
│   └── AuthContext.jsx  # Global auth state & user session provider
├── layouts/
│   └── MainLayout.jsx   # Common layout with Navbar & Footer wrapper
├── lib/
│   ├── api.js           # Central Axios HTTP client with interceptors
│   └── format.js        # Currency (IDR) & localized date formatters
└── pages/
    ├── EventDetail.jsx  # Event details, description & ticket selection
    ├── Home.jsx         # Event showcase & search catalog
    ├── Login.jsx        # Customer login screen
    ├── NotFound.jsx     # Custom 404 page
    └── Register.jsx     # Customer registration screen
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org) (v18.0 or newer)
* [Backend API](https://github.com/ticketing-system-platform/backend-ticketing-system) running on `http://localhost:8000`

### 1. Configure Environment Variables
Copy `.env.example` to create `.env`:
```bash
cp .env.example .env
```
Ensure the API endpoint is configured:
```env
VITE_API_URL=http://localhost:8000/api
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-your-key-here
VITE_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📦 Production Build

```bash
# Compile and bundle with Vite
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).
