<p align="center">
  <img src="docs/screenshots/landing-hero.png" alt="CareSphere Landing Page" width="800"/>
</p>

<h1 align="center">🩺 CareSphere — Trusted Caregiving Marketplace Platform</h1>

<p align="center">
  <strong>A modern, full-stack web application connecting families with verified, compassionate caregivers through intelligent matching, real-time communication, and secure data management.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/NestJS-11-ea2845?style=for-the-badge&logo=nestjs" alt="NestJS"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma" alt="Prisma"/>
  <img src="https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socket.io" alt="Socket.IO"/>
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Stripe-Integrated-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

<p align="center">
  <a href="#-introduction">Introduction</a> •
  <a href="#-literature-review">Literature Review</a> •
  <a href="#-methodology">Methodology</a> •
  <a href="#-investigation-and-analysis">Investigation & Analysis</a> •
  <a href="#-design">Design</a> •
  <a href="#-implementation">Implementation</a> •
  <a href="#-evaluation-of-product">Evaluation</a> •
  <a href="#-critical-evaluation-of-project">Critical Evaluation</a> •
  <a href="#-conclusion">Conclusion</a>
</p>

---

# 📘 Introduction

## 1.1 Project Overview

CareSphere is a comprehensive, production-grade caregiving marketplace platform designed to bridge the gap between families seeking professional care services and verified caregivers offering their expertise. The platform addresses a critical and growing need in the healthcare and social services sector: the difficulty families face in finding, vetting, and managing professional caregivers for their loved ones, whether they require elderly care, child care, special needs assistance, or other forms of personal care.

The application is architected as a modern monorepo containing two primary applications — a **Next.js 14 frontend** (React 18) and a **NestJS 11 backend API** — unified through a pnpm workspace with shared packages. The system leverages PostgreSQL 16 as its primary data store, managed through Prisma ORM, and implements real-time communication via Socket.IO WebSocket gateways for chat messaging, live notifications, video call signaling, and GPS location tracking.

CareSphere implements a role-based access control (RBAC) system with three primary user types: **Customers** (families seeking care), **Caregivers** (professionals providing care), and **Administrators** (platform managers). Each role has a distinct set of permissions, dashboards, and workflows tailored to their needs.

## 1.2 Problem Statement

The caregiving industry faces several systemic challenges that CareSphere aims to address:

1. **Trust Deficit**: Families often struggle to verify the credentials, background, and experience of potential caregivers. Without a reliable vetting mechanism, families are left to rely on word-of-mouth referrals or unverified online listings, which can lead to unsafe or inadequate care situations.

2. **Fragmented Communication**: Traditional caregiving arrangements rely on phone calls, text messages, and paper-based record keeping. This fragmentation leads to miscommunication, lost medical information, and a lack of accountability in the care delivery process.

3. **Inefficient Matching**: Finding the right caregiver involves considering numerous factors including specialisation, location, availability, language proficiency, hourly rates, and personality compatibility. Manual matching is time-consuming and often results in suboptimal pairings.

4. **Data Security Concerns**: Sensitive medical records, emergency contacts, and personal health information need to be shared between families and caregivers, but existing solutions lack proper encryption and access control mechanisms.

5. **Payment Transparency**: The absence of a standardised payment system leads to disputes over rates, hours worked, and service quality. Families need transparent invoicing, and caregivers need reliable income tracking.

6. **Administrative Overhead**: Managing a large pool of caregivers, verifying credentials, handling disputes, and monitoring platform health requires sophisticated administrative tooling that most existing solutions lack.

## 1.3 Project Objectives

The primary objectives of CareSphere are:

- **Develop a secure, scalable marketplace** that connects families with verified caregivers through an intuitive web interface
- **Implement an intelligent matching algorithm** that considers location proximity, skill compatibility, language preferences, and user ratings to recommend optimal caregiver-customer pairings
- **Build a real-time communication system** supporting instant messaging, typing indicators, read receipts, online presence detection, and WebRTC video calling
- **Create an encrypted Family Vault** using AES-256-GCM encryption for storing and selectively sharing sensitive medical records and care instructions
- **Integrate Stripe payment processing** for secure transactions, automated invoicing with PDF generation, and transparent earnings tracking
- **Establish a comprehensive admin dashboard** with analytics, user management, caregiver verification workflows, audit logging, and revenue reporting
- **Deploy using Docker containerisation** with separate containers for the API, frontend, PostgreSQL database, and Redis cache, enabling consistent deployment across environments

## 1.4 Scope and Limitations

The current scope of CareSphere encompasses the full lifecycle of a caregiving engagement: from user registration and caregiver discovery, through booking and real-time care coordination, to post-service review and payment processing. The platform supports web-based access through responsive design, with the frontend optimised for both desktop and mobile viewports.

Key limitations include the absence of a native mobile application (the platform is currently web-only), the reliance on Stripe for payment processing (limiting the platform to Stripe-supported regions), and the use of Puppeteer for PDF invoice generation (which introduces a heavyweight dependency). Additionally, the video calling feature utilises WebRTC signaling through Socket.IO but does not include a TURN server configuration for NAT traversal, which may limit its effectiveness in certain network environments.

## 1.5 Target Audience

CareSphere serves three distinct user groups:

- **Families and Individuals** who require professional caregiving services for elderly relatives, children, individuals with special needs, or other dependents requiring regular or occasional care
- **Professional Caregivers** who wish to offer their services through a trusted platform, manage their schedule and earnings, and build their professional reputation through verified reviews
- **Platform Administrators** who oversee the marketplace, verify caregiver credentials, manage user accounts, resolve disputes, and monitor platform analytics

## 1.6 Technologies Used

| Layer | Technology | Version | Purpose |
|:------|:-----------|:--------|:--------|
| Frontend Framework | Next.js | 14.2 | Server-side rendering, routing, React framework |
| UI Library | React | 18.x | Component-based user interface development |
| Styling | TailwindCSS | 3.4 | Utility-first CSS framework for responsive design |
| Animation | Framer Motion | 12.x | Declarative animations and transitions |
| Icons | Lucide React | 1.8 | Modern, customisable icon library |
| Charts | Recharts | 3.8 | Data visualisation for admin analytics |
| Maps | Leaflet + React Leaflet | 1.9 / 5.0 | Interactive maps for location-based features |
| Backend Framework | NestJS | 11.x | Modular, TypeScript-first Node.js framework |
| ORM | Prisma | 7.7 | Type-safe database access and migrations |
| Database | PostgreSQL | 16 | Relational data storage with advanced indexing |
| Cache | Redis | 7.x | Session management and rate limiting cache |
| Authentication | Passport.js + JWT | - | Stateless authentication with access/refresh tokens |
| Password Hashing | Argon2 | 0.44 | Memory-hard password hashing algorithm |
| Real-time | Socket.IO | 4.8 | Bidirectional WebSocket communication |
| Payments | Stripe | 22.x | Payment intent creation and webhook processing |
| File Storage | Cloudinary | 2.9 | Cloud-based image and document storage |
| Email | Nodemailer | 8.x | Transactional email delivery via SMTP |
| PDF Generation | Puppeteer | 24.x | Server-side PDF invoice rendering |
| API Documentation | Swagger / OpenAPI | 11.3 | Interactive API documentation |
| Testing | Jest + Playwright | 30 / 1.59 | Unit testing and end-to-end browser testing |
| Containerisation | Docker + Docker Compose | - | Multi-service container orchestration |
| CI/CD | GitHub Actions | - | Automated testing and deployment pipeline |
| Package Manager | pnpm | 10.33 | Fast, disk-space efficient package manager |
| Language | TypeScript | 5.x | Static typing across the entire codebase |

---

# 📚 Literature Review

## 2.1 The Growing Demand for Digital Caregiving Platforms

The global caregiving industry has experienced unprecedented growth in recent years, driven by demographic shifts including an ageing population, increasing dual-income households, and a growing awareness of the importance of professional care for individuals with special needs. According to the World Health Organisation, the global population aged 60 years and older is expected to reach 2.1 billion by 2050, creating an enormous demand for eldercare services. Similarly, the demand for child care services continues to grow as more families require dual incomes to maintain their standard of living.

Traditional caregiving arrangements — typically organised through personal networks, community bulletin boards, or local agencies — suffer from significant inefficiencies. These include limited caregiver pools, lack of transparent vetting processes, inconsistent pricing structures, and the absence of standardised quality metrics. The advent of digital marketplace platforms has the potential to address these challenges by leveraging technology to create more efficient, transparent, and trustworthy connections between care seekers and care providers.

## 2.2 Existing Solutions and Market Analysis

Several platforms currently operate in the caregiving marketplace space, each with distinct approaches and limitations:

**Care.com** is the largest global caregiving platform, connecting families with caregivers for child care, senior care, pet care, and housekeeping. While comprehensive in scope, Care.com has faced criticism for its verification processes, with reports of caregivers with criminal records passing through its background check system. The platform operates primarily as a listing service, lacking integrated booking, payment, and real-time communication features.

**Honor** focuses exclusively on elder care, providing a technology-enabled home care service. Honor employs caregivers directly and uses a proprietary app for care coordination. While this model ensures quality control, it limits scalability and geographic reach, and the direct employment model results in higher costs for families.

**CareLinx** (acquired by Humana) offered a marketplace model with integrated background checks and payment processing. The platform demonstrated the viability of technology-mediated caregiving but was ultimately absorbed into a larger healthcare corporation, reducing its availability as an independent platform.

**Sittercity** specialises in child care and babysitting services, providing a searchable database of caregivers with reviews and background checks. However, the platform lacks real-time communication features, scheduling tools, and the sophisticated matching algorithms that modern users expect.

## 2.3 Technology Stack Evaluation

### 2.3.1 Frontend Framework Selection

The choice of Next.js 14 as the frontend framework was informed by its superior support for server-side rendering (SSR), which is critical for SEO optimisation of public-facing pages such as the landing page and caregiver profiles. Next.js also provides an App Router with nested layouts, enabling the creation of distinct navigation experiences for each user role (Customer, Caregiver, Admin) through route groups. The framework's built-in image optimisation, font loading, and code splitting capabilities contribute to optimal performance metrics. React 18's concurrent features, including Suspense and automatic batching, enable responsive user interfaces even under heavy data loads.

### 2.3.2 Backend Framework Selection

NestJS was selected for the backend due to its modular architecture, which naturally maps to the domain-driven design of the caregiving platform. Each domain concern — authentication, bookings, payments, chat, notifications — is encapsulated in its own module with dedicated controllers, services, and data transfer objects (DTOs). NestJS's first-class support for WebSocket gateways through the `@nestjs/websockets` and `@nestjs/platform-socket.io` packages enables seamless integration of real-time features alongside REST endpoints within the same application.

The framework's dependency injection system ensures loose coupling between modules, facilitating testability and maintainability. The `ValidationPipe` with `class-validator` and `class-transformer` libraries provides robust request validation and transformation, preventing invalid data from reaching the database layer.

### 2.3.3 Database and ORM Selection

PostgreSQL 16 was chosen as the primary database for its robust support for complex queries, full-text search, JSON data types, and advanced indexing capabilities. The database's ACID compliance and mature ecosystem make it an ideal choice for a marketplace platform where data integrity is paramount — particularly for financial transactions, booking schedules, and medical records.

Prisma ORM provides a type-safe database client that generates TypeScript types directly from the database schema, eliminating runtime type errors and providing excellent developer experience through auto-completion and compile-time validation. The Prisma migration system enables version-controlled schema changes, ensuring consistent database state across development, staging, and production environments.

### 2.3.4 Real-time Communication

Socket.IO was selected over alternatives such as raw WebSockets or Server-Sent Events (SSE) due to its automatic fallback mechanisms, built-in room management, and namespace support. The platform utilises four distinct Socket.IO namespaces — `/chat`, `/notifications`, `/video`, and `/location` — each handling a specific real-time concern. This separation enables independent scaling and monitoring of real-time features.

### 2.3.5 Security Considerations

The platform implements multiple security layers informed by OWASP best practices:

- **Password Security**: Argon2 (specifically `argon2id`) is used for password hashing, chosen over bcrypt for its superior resistance to GPU-based attacks and its status as the winner of the Password Hashing Competition (PHC)
- **JWT Authentication**: A dual-token strategy (15-minute access tokens and 7-day refresh tokens) balances security with user convenience, automatically refreshing expired sessions without user intervention
- **Data Encryption**: The Family Vault implements AES-256-GCM authenticated encryption, providing both confidentiality and integrity verification for sensitive medical data
- **API Security**: Helmet.js provides HTTP security headers, CORS is configured with origin restrictions, and NestJS Throttler implements rate limiting with configurable time windows
- **Input Validation**: Global `ValidationPipe` with `whitelist` and `forbidNonWhitelisted` options strips unknown properties from request bodies, preventing mass assignment vulnerabilities

## 2.4 Academic Foundations

The development of CareSphere draws upon several academic disciplines and established design patterns:

- **Domain-Driven Design (DDD)**: The backend architecture follows DDD principles, with each bounded context (Auth, Bookings, Payments, etc.) implemented as an independent NestJS module with its own domain models, services, and controllers
- **Event-Driven Architecture**: The notification system follows an event-driven pattern where domain events (booking status changes, new messages) trigger notifications across multiple channels (in-app, WebSocket, email)
- **Haversine Formula**: The intelligent matching algorithm uses the Haversine formula for calculating great-circle distances between user coordinates, enabling proximity-based caregiver discovery
- **Multi-factor Scoring**: The matching algorithm implements a weighted scoring system across four dimensions (skills: 40%, distance: 30%, ratings: 20%, language: 10%), based on research in multi-criteria decision analysis (MCDA)
- **Finite State Machine**: The booking lifecycle implements a finite state machine pattern with defined state transitions (PENDING → CONFIRMED → IN_PROGRESS → COMPLETED or CANCELLED), preventing invalid status changes

---

# 🔬 Methodology

## 3.1 Development Approach

CareSphere was developed following an **Agile methodology** with iterative sprints, each focused on delivering specific functional increments. The development process was structured around the following phases:

1. **Requirements Gathering and Analysis**: Comprehensive analysis of the caregiving industry, stakeholder needs, and competitive landscape
2. **System Architecture Design**: Definition of the technology stack, database schema, API structure, and deployment architecture
3. **Iterative Development**: Implementation of features in priority-ordered sprints, with continuous integration and testing
4. **Quality Assurance**: Unit testing, integration testing, and end-to-end testing using Jest and Playwright
5. **Documentation and Deployment**: Creation of comprehensive documentation and Docker-based deployment configuration

The project utilises a **monorepo architecture** managed by pnpm workspaces, enabling shared code and consistent dependency management across the frontend and backend applications. The workspace structure is defined as:

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'      # api (NestJS) and web (Next.js)
  - 'packages/*'  # shared types and utilities
```

## 3.2 Project Structure

The CareSphere monorepo is organised into a clear, hierarchical directory structure:

```
caresphere/
├── apps/
│   ├── api/                          # NestJS Backend Application
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema definition
│   │   │   ├── seed.ts               # Test data seeding script
│   │   │   └── migrations/           # Version-controlled schema migrations
│   │   ├── src/
│   │   │   ├── main.ts               # Application bootstrap and configuration
│   │   │   ├── app.module.ts          # Root module with all feature modules
│   │   │   ├── auth/                  # Authentication and authorisation
│   │   │   ├── users/                 # User profile management
│   │   │   ├── caregivers/            # Caregiver-specific operations
│   │   │   ├── bookings/              # Booking lifecycle management
│   │   │   ├── matching/              # Intelligent caregiver matching
│   │   │   ├── chat/                  # Real-time messaging
│   │   │   ├── video/                 # WebRTC video call signaling
│   │   │   ├── payments/              # Stripe payment processing
│   │   │   ├── invoices/              # PDF invoice generation
│   │   │   ├── vault/                 # Encrypted Family Vault
│   │   │   ├── notifications/         # Multi-channel notifications
│   │   │   ├── reviews/               # Review and rating system
│   │   │   ├── uploads/               # Cloudinary file management
│   │   │   ├── admin/                 # Administrative operations
│   │   │   ├── prisma/                # Prisma service provider
│   │   │   └── common/                # Shared filters, pipes, middleware
│   │   ├── test/                      # E2E tests
│   │   └── Dockerfile                 # Production container image
│   │
│   └── web/                          # Next.js Frontend Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx           # Landing page (30KB, fully animated)
│       │   │   ├── layout.tsx         # Root layout with providers
│       │   │   ├── globals.css        # Global design system (30KB)
│       │   │   ├── (auth)/            # Authentication pages
│       │   │   ├── (customer)/        # Customer-specific routes
│       │   │   ├── (caregiver)/       # Caregiver-specific routes
│       │   │   ├── (admin)/           # Admin dashboard routes
│       │   │   ├── (shared)/          # Shared real-time feature routes
│       │   │   └── (info)/            # Static information pages
│       │   ├── components/
│       │   │   ├── ui/                # Reusable UI components
│       │   │   ├── layout/            # Navbar and Footer components
│       │   │   ├── chat/              # Chat interface components
│       │   │   ├── video/             # Video call components
│       │   │   ├── maps/              # Leaflet map components
│       │   │   └── payments/          # Stripe payment components
│       │   ├── lib/
│       │   │   ├── api.ts             # Centralised API client with auth
│       │   │   ├── auth-context.tsx   # Authentication context provider
│       │   │   └── export-csv.ts      # CSV export utility
│       │   └── hooks/
│       │       └── use-socket.ts      # WebSocket connection hook
│       ├── public/                    # Static assets
│       ├── tests/                     # Playwright E2E tests
│       ├── tailwind.config.ts         # Design system configuration
│       └── Dockerfile                 # Production container image
│
├── packages/
│   └── shared/                       # Shared types and constants
│       └── index.ts                   # APP_NAME, VERSION, UserDTO
│
├── guides/                           # 16 implementation guides (00-15)
├── docs/screenshots/                 # Application screenshots
├── docker-compose.yml                # Development environment
├── docker-compose.prod.yml           # Production deployment
├── .github/workflows/ci.yml          # GitHub Actions CI pipeline
└── pnpm-workspace.yaml               # Monorepo workspace definition
```

## 3.3 Database Design Methodology

The database schema was designed following normalisation principles up to Third Normal Form (3NF), with strategic denormalisation where query performance justified it. The schema comprises 12 primary models:

| Model | Purpose | Key Relationships |
|:------|:--------|:-----------------|
| `User` | Core identity model with RBAC | Has Profile, CustomerProfile, CaregiverProfile |
| `Profile` | Common user information | Belongs to User; stores name, avatar, location, languages |
| `CustomerProfile` | Care-seeker preferences | Belongs to User; stores care type, frequency, requirements |
| `CaregiverProfile` | Provider qualifications | Belongs to User; stores rate, specialties, certifications, verification status |
| `Booking` | Service engagement record | Connects Customer ↔ Caregiver with schedule, cost, status |
| `Review` | Post-service feedback | Links Author → Target via Booking |
| `FamilyVault` | Encrypted medical records | Belongs to Customer; AES-256-GCM encrypted data |
| `Message` | Chat communication | Sender → Receiver, optionally linked to Booking |
| `Notification` | System alerts | Belongs to User; supports multiple notification types |
| `Invoice` | Payment documentation | Belongs to Booking; PDF generation with Stripe integration |
| `Earning` | Caregiver revenue tracking | Belongs to Booking; 10% platform fee deduction |
| `AuditLog` | Administrative action history | Links Admin user to tracked actions with metadata |

The schema utilises PostgreSQL-specific features including UUID primary keys, array fields (for `specialties`, `certifications`, `languages`, `allowedCaregiverIds`), JSON metadata storage (in `AuditLog`), and composite indexes for optimised query patterns.

## 3.4 API Design Methodology

The REST API follows a resource-oriented design with consistent endpoint patterns:

```
POST   /auth/register          # User registration with role-based profiles
POST   /auth/login             # JWT authentication with token pair
POST   /auth/refresh           # Token rotation using refresh token
GET    /auth/me                # Current user profile retrieval
POST   /auth/verify-email      # Email verification with token
POST   /auth/forgot-password   # Password reset initiation
POST   /auth/reset-password    # Password reset completion

GET    /users/:id              # User profile retrieval
PATCH  /users/:id              # Profile update

GET    /caregivers             # Caregiver listing with filters
GET    /caregivers/:id         # Caregiver detail with reviews
PATCH  /caregivers/profile     # Caregiver profile update

POST   /bookings               # Create booking request
GET    /bookings               # List user bookings
GET    /bookings/:id           # Booking detail with relations
PATCH  /bookings/:id/status    # Status transition (state machine)

POST   /matching/find          # Intelligent caregiver matching
GET    /reviews/:userId        # Reviews for a specific user
POST   /reviews                # Create review for completed booking

POST   /payments/create-intent # Stripe payment intent creation
POST   /payments/webhook       # Stripe webhook handler
GET    /payments/history       # Payment history with pagination

POST   /vault                  # Create encrypted vault entry
GET    /vault                  # List customer vault entries
POST   /vault/:id/grant        # Grant caregiver access
POST   /vault/:id/revoke       # Revoke caregiver access

POST   /invoices/generate      # Generate PDF invoice via Puppeteer
GET    /invoices/:id           # Retrieve invoice details

GET    /admin/users            # User management with search
POST   /admin/users/:id/ban    # Toggle user ban status
GET    /admin/caregivers/pending  # Pending verifications
POST   /admin/caregivers/:id/verify  # Approve/reject caregiver
GET    /admin/analytics        # Platform-wide analytics
GET    /admin/logs             # Audit log retrieval
```

All endpoints are documented through Swagger/OpenAPI at `/api/docs`, providing interactive API exploration with authentication support.

## 3.5 Security Methodology

Security was implemented as a cross-cutting concern across all layers:

**Authentication Flow:**
1. User submits credentials via `POST /auth/login`
2. Server validates credentials using Argon2 hash comparison
3. Server generates JWT access token (15min) and refresh token (7d)
4. Client stores tokens in `localStorage` and includes access token in `Authorization: Bearer` header
5. On 401 response, the API client automatically attempts token refresh
6. On refresh failure, the user is redirected to the login page

**Authorisation Layers:**
- `JwtAuthGuard`: Validates JWT signature and expiration
- `RolesGuard`: Enforces role-based access (CUSTOMER, CAREGIVER, ADMIN)
- `WsJwtGuard`: Validates WebSocket connections with JWT
- Resource-level checks: Services verify ownership before allowing operations

## 3.6 Testing Methodology

The testing strategy encompasses three levels:

1. **Unit Tests** (Jest): Service-level logic testing with mocked dependencies. Key test suites include `auth.service.spec.ts`, `bookings.service.spec.ts`, `matching.service.spec.ts`, and `vault.service.spec.ts`
2. **Integration Tests** (Jest + Supertest): API endpoint testing with a test database
3. **End-to-End Tests** (Playwright): Browser-based testing of complete user workflows

The CI pipeline runs all tests automatically on push to `main` or `develop` branches:

```yaml
# .github/workflows/ci.yml
- run: pnpm --filter api test      # Backend unit tests
- run: pnpm --filter api build     # Compilation verification
- run: pnpm --filter web build     # Frontend build verification
```

## 3.7 Deployment Methodology

CareSphere uses Docker containerisation for consistent deployment across environments:

**Development Environment** (`docker-compose.yml`):
- PostgreSQL 16 on port 5433
- Redis 7 on port 6379
- Adminer (database GUI) on port 8080
- API and Web run natively via `pnpm start:dev` and `pnpm dev`

**Production Environment** (`docker-compose.prod.yml`):
- Multi-stage Docker builds for API and Web (Node 20 Alpine base)
- PostgreSQL with persistent volume storage
- Redis for session and cache management
- Environment variable injection for secrets (JWT, Stripe, Vault keys)
