# Maverick AI CLI

An intelligent command-line interface powered by AI — your coding companion directly in your terminal. Authenticate via GitHub, chat with Gemini AI, and get intelligent responses with markdown rendering.

## Installation

Install globally:

```bash
npm install -g maverick-ai-cli
```

Or run directly with `npx`:

```bash
npx maverick-ai-cli <command>
```

> **Prerequisites:** Node.js 18+ is required.

## Commands

### `login` — Authenticate via GitHub

```bash
maverick login
```

Opens a browser for GitHub OAuth device flow authentication. Your credentials are stored locally at `~/.better-auth/token.json`.

### `whoami` — Check current user

```bash
maverick whoami
```

### `logout` — Sign out

```bash
maverick logout
```

### `wakeup` — Start AI session

```bash
maverick wakeup
```

Select a mode:
- **Chat** — Conversational AI with markdown rendering
- **Tool Calling** — AI with Google Search & code execution *(coming soon)*
- **Agent** — Autonomous AI agent *(coming soon)*

### Chat Features

- Markdown rendering in terminal
- Context-aware conversations
- Persistent session history
- Streaming AI responses

## Development

### Server Setup

The backend server powers authentication and data storage. It's deployed at `https://maverick-cli.onrender.com`.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CodeMaverick-143/maverick-cli.git
   cd maverick-cli/server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL="postgresql://..."
   GITHUB_CLIENT_ID="your_github_oauth_app_client_id"
   GITHUB_CLIENT_SECRET="your_github_oauth_app_client_secret"
   BETTER_AUTH_SECRET="your_random_auth_secret"
   BETTER_AUTH_URL="http://localhost:3005"
   GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key"
   ORBITAL_MODEL="gemini-2.5-flash"
   PORT=3005
   ```

4. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start the Server:**
   ```bash
   npm run dev
   ```

### Architecture

```
server/
├── src/
│   ├── index.js              # Express server + API endpoints
│   ├── cli/
│   │   ├── main.js            # CLI entry point (Commander.js)
│   │   ├── commands/
│   │   │   ├── auth/login.js  # login, logout, whoami
│   │   │   └── ai/wakeUp.js   # wakeup command
│   │   ├── chat/
│   │   │   └── chat-with-ai.js # AI chat loop
│   │   └── ai/
│   │       └── google-service.js # Gemini AI SDK
│   ├── lib/
│   │   ├── api-client.js      # CLI → Server HTTP client
│   │   ├── auth.js            # Better Auth config (server)
│   │   ├── db.js              # Prisma client (server)
│   │   └── token.js           # Token storage (~/.better-auth/)
│   ├── config/
│   │   ├── google.config.js   # AI model config
│   │   └── tool.config.js     # Tool definitions
│   └── service/
│       └── chat.service.js    # Chat DB service (server)
└── prisma/
    └── schema.prisma          # Database schema
```

### API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/*` | ALL | Better Auth routes |
| `/api/me` | GET | Get current session |
| `/api/cli/user` | GET | Get user from Bearer token |
| `/api/cli/conversations` | POST | Create conversation |
| `/api/cli/conversations/:id` | GET | Get conversation + messages |
| `/api/cli/conversations/:id/title` | PUT | Update title |
| `/api/cli/conversations/:id/messages` | GET | List messages |
| `/api/cli/conversations/:id/messages` | POST | Create message |

## Tech Stack

- **Runtime:** Node.js
- **AI:** Google Gemini via Vercel AI SDK
- **Auth:** Better Auth (GitHub OAuth + Device Flow)
- **Database:** PostgreSQL + Prisma ORM
- **Server:** Express 5
- **CLI:** Commander.js, Clack prompts, Chalk

## License

ISC
