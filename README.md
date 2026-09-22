# React Microfrontend Architecture

A decoupled, production-grade Microfrontend (MFE) architecture built with **React 18**, **Webpack 5 Module Federation**, **Tailwind CSS**, **Axios (with Request & Response Interceptors)**, and **Yup Form Validation**, consisting of three independent applications:

1. **Host App (Container)** – Running at [http://localhost:3000](http://localhost:3000)
2. **Products Microfrontend (Remote)** – Running at [http://localhost:3001](http://localhost:3001)
3. **Cart Microfrontend (Remote)** – Running at [http://localhost:3002](http://localhost:3002)

---

## 🏗️ Architecture Overview

```text
               ┌──────────────────────────────────────────────┐
               │              Host Container App              │
               │            (http://localhost:3000)           │
               │  - Webpack Module Federation Host            │
               │  - Client Routing (/products, /cart)         │
               │  - Responsive Tailwind Navbar & Mobile Menu  │
               │  - Real-Time Cart Counter Badge              │
               │  - Error Boundaries & Suspense Fallbacks     │
               └───────────────┬──────────────┬───────────────┘
                               │              │
           Dynamic Remote Load │              │ Dynamic Remote Load
           (products/ProductsList)            │ (cart/CartList)
                               ▼              ▼
     ┌────────────────────────────────┐  ┌────────────────────────────────┐
     │      Products Microfrontend    │  │       Cart Microfrontend       │
     │     (http://localhost:3001)    │  │     (http://localhost:3002)    │
     │  - Exposes: ./ProductsList     │  │  - Exposes: ./CartList         │
     │  - Axios Client + Interceptors │  │  - Axios Client + Interceptors │
     │  - Yup Product Validation Form │  │  - Yup Checkout Validation Form│
     │  - Dynamic Filter & Search     │  │  - Coupon Codes & Order Calc   │
     │  - Standalone Mode Supported   │  │  - Standalone Mode Supported   │
     └────────────────────────────────┘  └────────────────────────────────┘
                               ▲              ▲
                               │              │
                               └──────────────┘
                         Window Custom Events & LocalStorage
                      (MFE_CART_ADD_ITEM, MFE_CART_UPDATED)
```

---

## 📁 Repository Structure

```text
.
├── package.json              # Root scripts (install & run all via concurrently)
├── README.md                 # Project documentation & design decisions
│
├── host/                     # Container Application (Port 3000)
│   ├── package.json
│   ├── webpack.config.js     # Configures ModuleFederationPlugin remotes
│   ├── public/
│   │   └── index.html        # Tailwind CSS & Inter font setup
│   └── src/
│       ├── index.js          # Dynamic bootstrap import
│       ├── bootstrap.js      # App mount
│       ├── index.css         # Global styles
│       ├── App.jsx           # Responsive layout & lazy federated components
│       └── components/
│           ├── Navbar.jsx    # Responsive Navbar with mobile drawer & badge
│           ├── ErrorBoundary.jsx # Resilient error handling for remotes
│           └── LoadingFallback.jsx
│
├── products/                 # Products Remote App (Port 3001)
│   ├── package.json
│   ├── webpack.config.js     # Exposes ./ProductsList
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── bootstrap.js
│       ├── index.css
│       ├── App.jsx           # Standalone preview wrapper
│       ├── api/
│       │   └── axiosClient.js # Axios instance with Request/Response Interceptors
│       ├── validation/
│       │   └── productSchema.js # Yup validation schema for new products
│       ├── data/
│       │   └── products.js   # Fallback catalog data
│       └── components/
│           ├── ProductsList.jsx # Responsive product catalog & filters
│           └── AddProductModal.jsx # Yup-validated product creation modal
│
└── cart/                     # Cart Remote App (Port 3002)
    ├── package.json
    ├── webpack.config.js     # Exposes ./CartList
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── bootstrap.js
        ├── index.css
        ├── App.jsx           # Standalone preview wrapper
        ├── api/
        │   └── axiosClient.js # Axios instance with Request/Response Interceptors
        ├── validation/
        │   └── checkoutSchema.js # Yup validation schema for checkout & payment
        └── components/
            ├── CartList.jsx  # Responsive cart, stepper, & summary
            └── CheckoutModal.jsx # Yup-validated checkout modal
```

---

## ⚡ Quick Start Instructions

### Prerequisites
- **Node.js**: v18+ (tested on v22.15.0)
- **npm**: v9+ (tested on v10.9.2)

### 1. Install All Dependencies
From the root directory, run:
```bash
npm run install:all
```
*Or manually:*
```bash
npm install
cd host && npm install
cd ../products && npm install
cd ../cart && npm install
```

### 2. Start All Three Applications
From the root directory, run:
```bash
npm start
```
This uses `concurrently` to start:
- **Host App**: [http://localhost:3000](http://localhost:3000)
- **Products App**: [http://localhost:3001](http://localhost:3001)
- **Cart App**: [http://localhost:3002](http://localhost:3002)

---

## 🧩 Key Highlights & Technologies

### 1. Tailwind CSS & Responsive Design
- **Mobile-First Layout**: Fully responsive from mobile devices (`<640px`) to ultra-wide displays (`xl:`).
- **Responsive Navigation**: Desktop navigation with active states and a mobile hamburger drawer navigation.
- **Product Catalog Grid**: 1 column on mobile, 2 columns on tablet, 3 columns on desktop, 4 columns on large screens.
- **Responsive Cart**: 2-column layout (items + sticky summary) on desktop; cleanly stacked single-column on mobile.

### 2. Axios with Request & Response Interceptors
- **Request Interceptor**:
  - Automatically attaches Authorization token (`Bearer ...`).
  - Injects diagnostic headers (`X-Client-App`, `X-Request-Timestamp`).
  - Colorized console logging in development for complete auditability.
- **Response Interceptor**:
  - Automatically processes response status and data.
  - Catches HTTP errors (4xx, 5xx, network timeouts) and formats human-readable messages.

### 3. Yup Form Validation
- **Checkout Form**: Validates customer name, email format, phone format (min 10 digits), shipping address, city, state, postal code, payment method (Credit Card, UPI, COD), card details (16 digits, MM/YY, CVV), UPI ID, and terms agreement.
- **Add Product Form**: Validates product name (min 3 chars), category selection, positive price, rating (1.0 - 5.0), description (min 10 chars), and valid image URL.

### 4. Cross-Microfrontend Communication
- Browser-native **Custom Window Events** (`MFE_CART_ADD_ITEM`, `MFE_CART_UPDATED`) combined with `localStorage` persistence ensure state synchronization across Host and Remotes without tight coupling.
#   V e r s i o n N e x t T a s k  
 