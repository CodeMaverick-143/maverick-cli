# Maverick

An intelligent CLI tool powered by AI, featuring a full-stack architecture with a Next.js frontend and an Express/Prisma backend.

## Features

- **Maverick CLI**: A powerful command-line interface.
    - `maverick login`: Authenticate with the system.
    - `maverick logout`: Sign out.
    - `maverick whoami`: Check current user status.
    - `maverick wakeup`: Awaken the AI capabilities.
- **Web Client**: A modern Next.js application for managing your account and viewing data.
- **Backend Server**: Robust Express server with Prisma ORM for database management and `better-auth` for authentication.

## Project Structure

- **`client/`**: Next.js frontend application.
- **`server/`**: Backend server and CLI implementation.
    - `server/src/cli`: CLI specific code.
    - `server/src/main.js`: Server entry point.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (for Prisma)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CLI
   ```

2. **Setup Server & CLI:**
   ```bash
   cd server
   npm install
   # Configure .env (see .env.example if available)
   npx prisma generate
   npm run dev
   ```

3. **Setup Client:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. **Link CLI (Optional):**
   To usage the `maverick` command globally:
   ```bash
   cd server
   npm link
   ```

## Usage

Run the CLI using:
```bash
maverick help
```

## License

[ISC](LICENSE)