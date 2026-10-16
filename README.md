#  The Platter House — Catering & Food Delivery System

> A luxury catering storefront and real-time merchant operations portal built for high-end finger foods, small chops, party platters, and event catering in Lagos, Nigeria.

---

## 📌 Project Overview

**The Platter House** is an end-to-end food ordering and vendor fulfillment platform engineered to bridge the gap between upscale customer presentation and high-volume kitchen operations. 

It provides an elegant, multi-step customer ordering flow (integrated with **Paystack** and direct **GTBank transfers**) paired with an authenticated, PIN-protected **Vendor / Admin Suite** that manages order fulfillment, customer records, and physical thermal kitchen slips.

---

## ✨ Core Features

### 🛍️ 1. Customer Storefront
* **Curated Food Collections:** Signature Small Chops, Platters & Trays, and Pastries & Desserts with high-contrast imagery and transparent pricing.
* **Smart Cart & Multi-Step Checkout:** Real-time quantity counters, delivery fee calculations, and delivery date/time slot selections.
* **Dual Payment Gateway:**
  * **Paystack (Online):** Card, Bank Transfer, and USSD with auto-confirmation.
  * **Direct Bank Transfer (Manual):** Instant GTBank account copy and WhatsApp proof dispatch.
* **Live Order Tracking (`#track`):** Real-time 4-stage tracking progress bar (*Confirmed ➔ Preparing ➔ Out for Delivery ➔ Delivered*) synchronized with merchant actions.

### 🔐 2. Vendor / Admin Suite (`#admin`)
* **Security PIN Gate:** 4-digit PIN lock (`1234`) featuring automatic verification on the 4th digit, physical laptop keyboard support (`0–9`, Backspace, Esc), subtle loader feedback, and automatic session lock on navigation away.
* **Order Lifecycle & State Management:** Filter orders by status (*Pending, Confirmed, Preparing, Out for Delivery, Delivered*), update tracking stages in real-time, and confirm manual GTBank bank transfers.
* **Order Modification & Safe Deletion:** Edit customer delivery addresses, phone numbers, and dietary notes on the fly, with safety confirmation safeguards on order deletion.
* **Animated POS Thermal Receipt Dispenser:**
  * Authentic mechanical paper feed animation with micro-stepped stepper motor physics.
  * Perforated sawtooth tear-off edge.
  * **1-Click Dual Ticket Switcher:**
    * **Customer Receipt:** Branded logo, itemized prices, billing subtotals, Paystack/GTBank payment reference stamp, and vector barcode.
    * **Kitchen Prep Slip (KOT):** Chef copy with bold target delivery times, dish checkboxes `[ ]`, dietary/allergy warnings, packaging checklist, and head chef sign-off line.
  * **Pure Print Styles:** Optimized `@media print` rules stripping UI clutter to output clean 80mm thermal paper receipts or PDFs.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 18
* **Build Tooling:** Vite
* **Styling & Design System:** Tailwind CSS, Custom Keyframes (`@keyframes dispenseReceipt`)
* **Typography:** Fraunces (Luxury Serif Display) & Work Sans (Clean Modern Sans)
* **Storage & State Synchronization:** `localStorage` & `sessionStorage` multi-tab sync
* **Payment Integration:** Paystack Inline JS SDK + WhatsApp Business API deep linking

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/the-platter-house-catering.git
cd "Catering Website SYSTEM"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 🔑 Default Credentials & Quick Routes

| Route | Purpose | Credentials |
| :--- | :--- | :--- |
| `/#` | Main Customer Landing Page | Public |
| `/#shop` | Full Product Catalog & Menu | Public |
| `/#track` | Real-time Customer Order Tracking | Public (`TPH-10482` for demo) |
| `/#cart` | Cart & Paystack / Transfer Checkout | Public |
| `/#admin` | Vendor & Kitchen Operations Portal | **PIN: `1234`** |

---

## 🧪 Notes for Testers

1. **Placing a Test Order:** Go to `/#shop`, add items to your cart, and proceed to checkout. You can select either *Bank Transfer (Manual)* or *Quick Test Simulation Mode* to test checkout without spending real money.
2. **Vendor Order Verification:** Go to `/#admin` (PIN `1234`). You will see the new order appear in real-time. Test approving payment, advancing stages, editing customer details, or printing tickets!
3. **Receipt Printing:** Click **Print Slip** on any order to experience the mechanical POS thermal ticket dispenser animation. Toggle between **Customer** and **Kitchen** modes.
