# Zyppr — AI Assistant for Wellness & Fitness (SaaS)

Zyppr is a multi-tenant, AI-powered platform for the Wellness & Fitness industry with two role-based apps:

- **Admin (Business Owners):** services, appointments, AI marketing, photos, broadcasts, AI chat.
- **Customer (Users):** discover nearby studios/gyms, view services, conversational booking, profile, appointments.

Zyppr’s core is a **conversational AI** (Google Gemini) returning **strict JSON** validated with **Zod**—so UI cards (Service, Appointment, Notifications) render from structured data, not free text.

<p align="center">
  <img src="docs/hero-screenshot.png" alt="Zyppr preview" width="800"/>
</p>

---

## ✨ Features

### Admin (Business Owners)
- **Dashboard & Insights:** KPIs for AI inquiries, bookings, marketing; proactive suggestions.
- **Services CRUD:** add/edit/remove; one-click **AI description**.
- **Appointments:** list, inline edit, cancel; **AI booking from text** (paste chat/email).
- **Marketing:** generate **post text (Gemini)** + **image (Imagen)**.
- **Photos:** studio/gym gallery.
- **Broadcasts:** announcements to subscribed customers (for Gym or Both).
- **AI Chat (Admin Mode):** structured JSON responses for admin actions.

### Users (Customers)
- **Discovery:** nearby businesses by ZIP; **demo seeding** if empty.
- **Services & Booking:** browse, pick time slot, confirm; **conversational booking** via AI.
- **Profile:** edit details; secure password reset.
- **Appointments:** upcoming & history; cancel with confirmation.

---

## 🧱 Tech & Architecture

- **React 19 + TypeScript**, SPA, component-based UI.
- **Styling:** Tailwind CSS, `clsx`, `tailwind-merge`, dynamic themes via CSS vars (`theme-yoga`, `theme-gym`).
- **AI:** `@google/genai`
  - `gemini-2.5-flash` for chat/JSON/content.
  - `imagen-4.0-generate-001` for images.
- **Validation:** **Zod** schemas harden all AI responses.
- **State:** React Context API (`AuthContext`, `BusinessContext`), mock persistence with `localStorage`.
- **Buildless dev:** CDN modules via **importmap** in `index.html`.

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for diagrams and flows.

---

## 🚀 Quickstart

1. **Clone & install**
   ```bash
   git clone https://github.com/<you>/zyppr.git
   cd zyppr
   # Buildless setup; if you use a dev server, e.g.:
   npx serve .  # or any static server
