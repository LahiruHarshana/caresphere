# 💻 CareSphere: Developer Testing & Usage Guide

Welcome to the **CareSphere** developer documentation. This guide is specifically designed for developers, QA engineers, and testers who want to explore, test, and understand the platform **role-by-role**. 

The platform uses a role-based access control (RBAC) system with three primary user types: **Admin**, **Customer**, and **Caregiver**.

---

## ⚡ Quick Start (Developer Setup)

Before you begin testing, ensure your local environment is running and seeded with test data.

1. **Start the Database (Docker):**
   ```bash
   docker-compose up -d postgres redis
   ```
2. **Migrate & Seed the Database:**
   This command applies schema changes and populates the DB with default users and test data.
   ```bash
   pnpm --filter api exec prisma migrate dev
   pnpm --filter api exec prisma db seed
   ```
3. **Start the Applications:**
   *Backend API:* `pnpm --filter api start:dev` (Runs on `http://localhost:4000`)
   *Frontend Web App:* `pnpm --filter web dev` (Runs on `http://localhost:3000`)

---

## 🔑 Test Accounts & Credentials

The database seeding script (`apps/api/prisma/seed.ts`) automatically generates the following test accounts. 

**Global Password for all accounts:** `password123`

| Role | Email | Description |
| :--- | :--- | :--- |
| **Admin** | `admin@caresphere.com` | Full system access, logs, and user management. |
| **Customer** | `customer1@example.com` | Seeker of care (has existing bookings & reviews). |
| **Customer** | `customer2@example.com` | Secondary customer account. |
| **Caregiver** | `sarah.c@example.com` | Verified caregiver (Elderly Care, Dementia). |
| **Caregiver** | `john.d@example.com` | Verified caregiver (Child Care, First Aid). |

---

## 🧪 Role-by-Role Walkthrough

To fully test the application, open multiple incognito windows or different browsers to log in as different roles simultaneously. This is especially useful for testing real-time features like **WebSockets (Chat & Notifications)**.

### 🛡️ 1. Administrator (`admin@caresphere.com`)
The Admin oversees the entire platform. 

**Base Route:** `http://localhost:3000/admin`

* **What to test:**
  * **Analytics Dashboard (`/admin/analytics`):** View platform metrics, total bookings, and revenue data.
  * **User Management (`/admin/users`):** View all registered users (Customers and Caregivers). Test banning/unbanning users.
  * **Caregiver Approvals (`/admin/caregivers`):** Review pending caregiver profiles and change their verification status to `APPROVED` or `REJECTED`.
  * **System Logs (`/admin/logs`):** View the `AuditLog` to see a history of administrative actions taken on the platform.

### 🧑‍🤝‍🧑 2. Customer (`customer1@example.com`)
The Customer is the user looking for caregiving services.

**Base Route:** `http://localhost:3000/`

* **What to test:**
  * **Discover Caregivers (`/caregivers` & `/caregivers/[id]`):** Browse the list of seeded caregivers. Test the filtering by specialties, location, or hourly rate. Click into a caregiver's profile to see their details and reviews.
  * **Booking Flow (`/book/[caregiverId]`):** Initiate a booking request. Select a service type, date, and time. This will create a `PENDING` booking in the database.
  * **Family Vault (`/vault`):** Test the encrypted vault system. Upload/add sensitive data (simulated medical notes) and grant access to a specific caregiver ID.
  * **Customer Profile (`/customer/profile`):** Update personal details, address, and location coordinates.

### 👩‍⚕️ 3. Caregiver (`sarah.c@example.com`)
The Caregiver is the service provider fulfilling booking requests.

**Base Route:** `http://localhost:3000/caregiver`

* **What to test:**
  * **Gig Management (`/gigs`):** View incoming booking requests from Customers. Change the status of a booking from `PENDING` to `CONFIRMED`, `IN_PROGRESS`, and finally `COMPLETED`.
  * **Availability Management (`/availability`):** Toggle the `isAvailable` status on the caregiver profile to see if they disappear from the Customer's search results.
  * **Earnings Dashboard (`/earnings`):** View earnings generated from `COMPLETED` bookings, minus the platform fee.
  * **Caregiver Profile (`/caregiver/profile`):** Update hourly rates, specialties, and experience years.

### 🔄 4. Shared Real-Time Features (Requires 2 Accounts)
To test WebSocket functionality, log in as `customer1@example.com` in one window and `sarah.c@example.com` in another.

* **Chat (`/chat`):** 
  * Initiate a conversation from a booking. 
  * Verify that messages sent by the Customer instantly appear on the Caregiver's screen without refreshing.
* **Live Notifications (`/notifications`):**
  * When a Customer creates a new booking, the Caregiver should receive an instant notification socket event.
  * When a Caregiver accepts a booking, the Customer should receive a confirmation notification.

---

## 🧩 Developer Architecture Notes

* **Prisma Schema (`apps/api/prisma/schema.prisma`):** All entities and enums are defined here. If you need to add a new role or status, start here.
* **API Endpoints:** The backend uses NestJS modules (`apps/api/src/...`). Each domain (e.g., `/users`, `/bookings`, `/vault`) has its own Controller and Service.
* **WebSocket Gateways:** Real-time features are handled by NestJS Gateways (e.g., `chat.gateway.ts`, `notifications.gateway.ts`, `video.gateway.ts`).
* **Vault Encryption:** Data stored in the `FamilyVault` model uses AES encryption before resting in PostgreSQL. The `VAULT_ENCRYPTION_KEY` in your `.env` is required to decrypt this data.