# CareSphere

CareSphere is a modern caregiver matching and management platform.

## Local Setup

### Prerequisites
- Node.js (v20+)
- pnpm
- Docker (for database)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   *Note: Fill in the required values in `.env`*

4. Start the database (if using Docker):
   ```bash
   docker-compose up -d
   ```

5. Run Prisma migrations:
   ```bash
   pnpm --filter api prisma migrate dev
   ```

### Running the Project

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
