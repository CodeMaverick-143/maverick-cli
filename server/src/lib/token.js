import fs from "node:fs/promises";
import chalk from "chalk";
import path from "path";
import os from "os";

// Token file paths
export const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
export const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

/**
 * Read the stored token data safely
 */
export async function getStoredToken() {
  try {
    const data = await fs.readFile(TOKEN_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Store a token with metadata
 */
export async function storeToken(token) {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });

    const tokenData = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      token_type: token.token_type || "Bearer",
      scope: token.scope,
      expires_at: token.expires_in
        ? new Date(Date.now() + token.expires_in * 1000).toISOString()
        : null,
      created_at: new Date().toISOString(),
    };

    await fs.writeFile(
      TOKEN_FILE,
      JSON.stringify(tokenData, null, 2),
      "utf-8"
    );

    return true;
  } catch (err) {
    console.error(chalk.red("Failed to store token:"), err.message);
    return false;
  }
}

/**
 * Remove stored token
 */
export async function clearStoredToken() {
  try {
    await fs.rm(TOKEN_FILE, { force: true });
    console.log(chalk.yellow("⚠ Token cleared"));
    return true;
  } catch (err) {
    console.error(chalk.red("Failed to clear token:"), err.message);
    return false;
  }
}

/**
 * Check if token is expired or about to expire (5 min window)
 */
export async function isTokenExpired() {
  const token = await getStoredToken();

  if (!token || !token.expires_at) {
    return true;
  }

  const expiresAt = new Date(token.expires_at).getTime();
  const now = Date.now();

  // token is considered expired if less than 5 minutes remain
  const FIVE_MINUTES = 5 * 60 * 1000;
  return expiresAt - now < FIVE_MINUTES;
}

/**
 * Require a valid token for authenticated commands
 */
export async function requireAuth() {
  const token = await getStoredToken();

  if (!token) {
    console.log(chalk.red("You are not logged in."));
    console.log(chalk.gray("Run: your-cli login\n"));
    process.exit(1);
  }

  if (await isTokenExpired()) {
    console.log(chalk.yellow("Your session has expired."));
    console.log(chalk.gray("Run: your-cli login\n"));
    process.exit(1);
  }

  return token;
}
