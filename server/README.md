# Maverick AI CLI

Maverick is an intelligent command-line interface powered by AI, designed to be your coding companion directly in your terminal. It features a robust backend integration, secure authentication, and a powerful chat interface.

## Installation

You can install Maverick globally using npm:

```bash
npm install -g maverick-ai-cli
```

## Usage

Once installed, you can use the `maverick` command to interact with the CLI.

### Authentication

Before using the AI features, you need to authenticate.

```bash
maverick login
```
This will open a browser window for you to sign in with your GitHub account.

To check your current login status:
```bash
maverick whoami
```

To logout:
```bash
maverick logout
```

### AI Companion

To start a chat session with Maverick:

```bash
maverick wakeup
```

This will enter an interactive mode where you can:
- **Chat**: Have a conversation with the AI.
- **Tools**: (Coming soon) Execute tools and perform actions.
- **Agent**: (Coming soon) Autonomous agent capabilities.

Supported features in chat:
- Markdown rendering in terminal.
- Context-aware conversations.
- Persistent session history.

## Development

If you want to contribute or run the server locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CodeMaverick-143/maverick-cli.git
   cd CLI/server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the `server` directory with the following:
   ```env
   DATABASE_URL="postgresql://..."
   GITHUB_CLIENT_ID="your_client_id"
   GITHUB_CLIENT_SECRET="your_client_secret"
   BETTER_AUTH_SECRET="your_auth_secret"
   BETTER_AUTH_URL="https://maverick-cli.onrender.com"
   GOOGLE_API_KEY="your_gemini_api_key"
   ```

4. **Run Database Migrations:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start the Server:**
   ```bash
   npm run dev
   ```

## Licenses
ISC
