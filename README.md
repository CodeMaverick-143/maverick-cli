# Maverick

An intelligent CLI tool powered by AI, featuring a full-stack architecture with a Next.js frontend and an Express/Prisma backend.

## Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/ce1b05b8-7bc0-4061-89c9-aa7a46722898" width="32%" />
  <img src="https://github.com/user-attachments/assets/cb1cdcd2-7d0e-4cae-9af0-dc83383f151d" width="32%" />
  <img src="https://github.com/user-attachments/assets/db7678d9-069d-4386-acce-a2b0a7f3b97c" width="32%" />
</p>


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
