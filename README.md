# 🌟 RateSphere Hub — FullStack Store Rating Platform

A full-stack web application that allows users to submit and modify store ratings (1 to 5 stars) with role-based access control (**System Administrator**, **Normal User**, and **Store Owner**). Built strictly following all specified requirements, modern full-stack development standards, and best architectural practices.

---

## 🛠️ Tech Stack

- **Backend Framework**: Express.js (Node.js + TypeScript)
- **Database & ORM**: MySQL (`store_rating_db`) with **Prisma ORM**
- **Frontend Framework**: React.js (Vite + TypeScript)
- **Styling**: Tailwind CSS with custom components & Lucide React icons
- **Authentication**: JWT (JSON Web Tokens) with role-based route guards (RBAC) & Bcrypt password hashing
- **Form Validation**: Strict client-side reactive validation + server-side Zod validation

---

## 🚀 Quick Start Guide

### 1. Navigate to Project Directory
Open your terminal and navigate to the project directory:
```bash
cd store-rating-platform
```

### 2. Verify Database Connection
Ensure MySQL is running (e.g., via XAMPP Control Panel or standalone).
The default configuration in `backend/.env`:
```env
DATABASE_URL="mysql://root:@localhost:3306/store_rating_db"
```

### 3. Initialize & Seed Database (One-time)
From the root directory, run:
```bash
npm run db:setup
```
*(This creates the database tables, applies Prisma schema, and populates initial admin, store owners, users, stores, and ratings).*

### 4. Run the Full-Stack Application
From the root directory, start both the backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Configured Demo Accounts

For instant testing, the login page includes **one-click quick-fill buttons**, or you can use these credentials:

| Role | Email | Password | Full Name |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@storerating.com` | `Admin@1234` | Administrator Master Account |
| **Store Owner** | `owner1@storerating.com` | `Owner@1234` | Jonathan Edward Mitchell |
| **Normal User** | `user1@storerating.com` | `User@12345` | Alexander Wright Patterson |

---

## 📋 Features by User Role

### 1. 🛡️ System Administrator
- **Dashboard Overview**:
  - Live metric card for **Total Users** (with breakdown of Admins, Store Owners, Normal Users).
  - Live metric card for **Total Stores**.
  - Live metric card for **Total Submitted Ratings**.
- **User Management**:
  - Add new users: Name (20-60 chars), Email, Password (8-16 chars + uppercase + special char), Address (max 400 chars), and Role (`ADMIN`, `USER`, `STORE_OWNER`).
  - View user directory with multi-field filters (**Name**, **Email**, **Address**, **Role**).
  - All columns sortable (ascending & descending).
  - **Store Owner Rating**: If the user is a Store Owner, their store's average rating and total ratings count are automatically calculated and displayed.
- **Store Management**:
  - Add new stores: Store Name (3-60 chars), Official Email, Physical Address (max 400 chars), and optional Store Owner assignment.
  - View store directory with multi-field filters (**Name**, **Email**, **Address**).
  - Sortable by Store Name, Email, Address, Overall Rating, and Ratings count.
- **Session**: Log out from the system.

### 2. 👤 Normal User
- **Sign Up**:
  - Registration page with live character counters and real-time validation checks for Name (20-60 chars), Email, Address (<=400 chars), and Password (8-16 chars with uppercase & special char).
- **Single Login Portal**: Logs in and lands directly on the customer store directory.
- **Store Discovery & Search**:
  - Search stores in real-time by **Name** and **Address**.
  - Toggle between **Table View** and **Grid View**.
  - Sort by Store Name, Address, Overall Rating, and My Submitted Rating.
- **Rating System**:
  - View Overall Rating (average score & review count).
  - View personal submitted rating (if already rated).
  - **Submit Rating**: 1 to 5 stars with interactive hover preview.
  - **Modify Rating**: Edit previously submitted rating anytime with instant recalculation.
- **Security**: Update password after logging in with strict password rule enforcement.
- **Session**: Log out from the system.

### 3. 🏬 Store Owner
- **Single Login Portal**: Logs in and lands directly on their dedicated Store Owner Portal.
- **Store Performance Metrics**:
  - Overall average rating badge (with 1-5 star widget).
  - Total ratings received counter.
- **Customer Ratings List**:
  - View every user who rated their store: Customer Name, Email, Address, Rating (1-5), and Submission Date.
  - Search customer feedback by Name or Email.
  - Sortable by Customer Name, Email, Rating Given, and Date.
- **Security**: Update password after logging in.
- **Session**: Log out from the system.

---

## 🔒 Form Validations Specification

Both client-side (reactive UI feedback) and server-side (Zod validation middleware) enforce:

1. **Name**:
   - Minimum: **20 characters**
   - Maximum: **60 characters**
2. **Address**:
   - Maximum: **400 characters**
3. **Password**:
   - Length: **8 to 16 characters**
   - Must contain at least **one uppercase letter** (`A-Z`)
   - Must contain at least **one special character** (`!@#$%^&*...`)
4. **Email**:
   - Standard RFC-compliant email validation rules.
5. **Rating**:
   - Integer between **1 and 5**.

---

## 📂 Project Structure

```
store-rating-platform/
├── package.json                 # Root script runner (runs backend & frontend concurrently)
├── README.md                    # Project documentation
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (User, Store, Rating models)
│   │   └── seed.ts              # Database seeder with sample accounts & stores
│   ├── src/
│   │   ├── config/              # Prisma client singleton
│   │   ├── controllers/         # Auth, Admin, Store controllers
│   │   ├── middlewares/         # JWT Auth, Role Guard, Zod validation
│   │   ├── routes/              # Express API route declarations
│   │   ├── utils/               # JWT sign/verify
│   │   └── server.ts            # Express server initialization
│   ├── .env                     # Backend environment configuration
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/                 # Axios client with JWT interceptor
    │   ├── components/          # Navbar, StarRating, StatCard, SortableHeader, ChangePasswordModal
    │   ├── context/             # AuthContext (state, token, login, logout)
    │   ├── pages/               # LoginPage, RegisterPage, AdminDashboard, UserDashboard, StoreOwnerDashboard
    │   ├── types/               # TypeScript interfaces
    │   ├── App.tsx              # Router & role-based route protection
    │   ├── index.css            # Tailwind styling
    │   └── main.tsx
    ├── tailwind.config.js
    ├── vite.config.ts
    ├── .env                     # Frontend environment configuration
    └── package.json
```

---

## 📡 REST API Reference

### Auth Endpoints (`/api/auth`)
- `POST /api/auth/register`: Register new normal user
- `POST /api/auth/login`: Single login for all roles
- `GET /api/auth/me`: Fetch current authenticated user
- `PUT /api/auth/change-password`: Update password

### Admin Endpoints (`/api/admin`) *(Requires ADMIN role)*
- `GET /api/admin/dashboard-stats`: Total users, stores, ratings count & role breakdown
- `POST /api/admin/users`: Create new user with role
- `GET /api/admin/users`: List users with search, role filters, sorting, and store owner ratings
- `POST /api/admin/stores`: Create new store with optional owner assignment
- `GET /api/admin/stores`: List stores with search, filters, and sorting
- `GET /api/admin/store-owners`: Get list of registered store owners

### Store & Rating Endpoints (`/api/stores`)
- `GET /api/stores`: List all stores with ratings, search by name/address, sorting
- `POST /api/stores/:storeId/rate`: Submit or modify rating (1 to 5)
- `GET /api/stores/owner/dashboard`: Store Owner dashboard with average rating and customer feedback list *(Requires STORE_OWNER role)*
