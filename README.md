# Maverick CLI

An intelligent command‑line interface that connects your terminal to an AI assistant.

The Maverick CLI lets you:

- **Authenticate** with a Better Auth–powered backend.
- **Wake up** the AI assistant and choose between chat modes.
- **Inspect your current session** with `whoami`.

> Note: Command names below assume the global executable is `maverick`. Adjust if your bin name differs.

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/CodeMaverick-143/CLI.git
cd CLI
npm install
```

Link the CLI globally (optional but recommended during development):

```bash
npm link
```

After linking, you should be able to run:

```bash
maverick --help
```

Make sure your `.env` contains the required values (e.g. `GITHUB_CLIENT_ID`, database URL, etc.).

---

## Authentication Commands

Authentication is handled via a device authorization flow backed by Better Auth. Tokens are stored under `~/.better-auth/token.json`.

### `maverick login`

Start the device login flow:

```bash
maverick login
```

What it does:

- Requests a device code from the auth server.
- Shows you a verification URL and user code.
- (Optionally) opens the browser for you.
- Polls the auth server until you approve the request.
- Stores an access token in `~/.better-auth/token.json`.

If a valid, non‑expired token already exists, you will be asked whether you want to log in again.

### `maverick logout`

Clear the stored token and log out:

```bash
maverick logout
```

This removes the token file and ends your authenticated session.

### `maverick whoami`

Show the currently authenticated user:

```bash
maverick whoami
```

This command:

- Ensures you are authenticated and your token is not expired.
- Looks up the associated user in the database via Prisma.
- Prints the user’s name, email, and id.

If you are not logged in or the token has expired, it will prompt you to log in.

---

## AI / Wake‑Up Commands

### `maverick wakeup`

Wake up the AI assistant and select a mode:

```bash
maverick wakeup
```

Flow:

- Requires a valid token (will exit with a message if you are not logged in).
- Fetches the current user from the database using your stored `access_token`.
- Greets you (e.g. `Welcome back, <name>!`).
- Presents a menu of options (e.g. **Chat**, **Tool Calling**, **Agent**).

Depending on your selection, the CLI will route you into the corresponding AI interaction mode (simple chat, tool‑calling chat, etc.).

---

## Development

Run the CLI locally (without global link) by using `node` or `npm` scripts, for example:

```bash
npm run dev
```

Or, if you have it linked globally and are developing the commands directly from this repo, just run:

```bash
maverick wakeup
maverick login
maverick whoami
```

### Environment

- Ensure `.env` is present in the project root.
- Make sure your database and Better Auth server are running and reachable from this CLI.

---

## Troubleshooting

- **"You are not logged in" / token not found**  
  Run `maverick login` again and complete the browser flow.

- **Token expired**  
  The CLI treats tokens as expired slightly before the real expiry (5‑minute buffer). Re‑run `maverick login`.

- **Database user not found**  
  Ensure that sessions are being created correctly on the server side for your `access_token`.

If you run into issues, open an issue on the repository with logs, CLI output, and steps to reproduce.
