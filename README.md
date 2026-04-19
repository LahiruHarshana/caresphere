# 💙 CareSphere

**CareSphere** is a modern, full-stack caregiver matching and management platform designed to connect families with qualified caregivers. It provides a secure, reliable, and user-friendly experience for managing bookings, communication, payments, and sensitive health information.

---

## 👥 Platform Roles & Capabilities

CareSphere is built with three distinct user experiences in mind, each tailored to specific needs:

### 1. 🧑‍🤝‍🧑 Customer (Families / Care Seekers)
Customers use CareSphere to find, book, and manage care for themselves or their loved ones.

* **Find the Perfect Match:** Search for caregivers based on location (Lat/Lng), specialties, languages spoken, experience, and hourly rates.
* **Seamless Booking:** Schedule care sessions, manage upcoming bookings, and track the status of current appointments (Pending, Confirmed, In Progress, Completed).
* **🔒 The Family Vault:** A highly secure, encrypted storage system (`FamilyVault`) for sensitive medical documents and care instructions. Customers can grant temporary access to specific caregivers.
* **Real-time Communication:** Chat with caregivers directly through the platform or initiate secure Video Calls for virtual consultations.
* **Payments & Invoices:** Integrated billing system. View invoices and pay securely via Stripe.
* **Ratings & Reviews:** Leave feedback and rate caregivers after a completed booking to help maintain community standards.

### 2. 👩‍⚕️ Caregiver (Service Providers)
Caregivers use CareSphere to manage their independent caregiving business, find gigs, and connect with clients.

* **Professional Profile:** Showcase certifications, specialties, years of experience, and set a custom hourly rate.
* **Trust & Verification:** Submit background checks and credentials for Admin approval to earn the "Verified" badge, increasing visibility and trust.
* **Gig Management:** View incoming booking requests, accept/decline jobs, and manage your daily schedule.
* **Earnings Dashboard:** Track pending and paid earnings transparently.
* **Secure Access:** Receive temporary access to a client's Family Vault to review critical care instructions before and during a shift.
* **Direct Communication:** Use the built-in chat and video tools to coordinate with families.

### 3. 🛡️ Administrator (Platform Management)
Admins ensure the platform runs smoothly, safely, and securely.

* **User Management:** Oversee all platform users. Admins can verify caregiver credentials, review profiles, and ban users who violate terms of service.
* **System Analytics:** Monitor overall platform health, booking volumes, and revenue metrics.
* **Dispute & Oversight:** Access system-wide data to resolve disputes between customers and caregivers.
* **Audit Logging:** Every administrative action is recorded in the `AuditLog` for compliance and security tracking.

---

## 🚀 Technology Stack

* **Frontend:** Next.js 15 (React), Tailwind CSS, TypeScript
* **Backend:** NestJS, Node.js, TypeScript
* **Database:** PostgreSQL with Prisma ORM
* **Real-time:** Socket.io (Chat & Notifications)
* **Payments:** Stripe Integration
* **Security:** Argon2 hashing, JWT Authentication, AES Encryption for Family Vault

---

## 🛠️ Local Setup & Development

### Prerequisites
- Node.js (v20+)
- pnpm
- Docker & Docker Compose (for the database)

### Installation

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env # Ensure API env is also set
   ```
   *Note: Fill in the required values (Database URL, JWT secrets, Stripe keys, etc.) in the `.env` files.*

4. **Start the database:**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Run Prisma migrations:**
   ```bash
   pnpm --filter api exec prisma migrate dev
   ```

### Running the Project

You can run the applications individually or together using pnpm workspaces.

- **Start API only:**
  ```bash
  pnpm --filter api start:dev
  ```

- **Start Web App only:**
  ```bash
  pnpm --filter web dev
  ```

### Running Tests

- **Run API unit tests:**
  ```bash
  pnpm --filter api test
  ```

- **Run Web tests:**
  ```bash
  pnpm --filter web test
  ```

---
*Built with ❤️ for better care.*
