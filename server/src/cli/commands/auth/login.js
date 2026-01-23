#!/usr/bin/env node

import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { logger } from "better-auth";
import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

import chalk from "chalk";
import { Command } from "commander";
import open from "open";
import os from "os";
import path from "path";
import yoctoSpinner from "yocto-spinner";
import * as z from "zod";
import dotenv from "dotenv";
import { clearStoredToken, getStoredToken, isTokenExpired, requireAuth, storeToken } from "../../../lib/token.js";
import prisma from "../../../lib/db.js";

dotenv.config();

const URL = "https://maverick-cli.onrender.com";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;

// ~/.better-auth/token.json
export const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
export const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

export async function loginAction(opts) {
  // Validate CLI args
  const OptionsSchema = z.object({
    serverUrl: z.string().optional(),
    clientId: z.string().optional(),
  });

  const parsed = OptionsSchema.parse(opts);

  const serverUrl = parsed.serverUrl || URL;
  const clientId = parsed.clientId || CLIENT_ID;

  intro(chalk.cyan("🔐 Better Auth – Device Login"));

  // Token check (optional)
  const existingToken = await getStoredToken();
  const expired = await isTokenExpired()

  if (existingToken && !expired) {
    const reAuth = await confirm({
      message: "You are already logged in. Login again?",
      initialValue: false,
    });

    if (isCancel(reAuth) || !reAuth) {
      cancel("Login cancelled");
      process.exit(0);
    }
  }

  // Create auth client
  const authClient = createAuthClient({
    baseURL: serverUrl,
    plugins: [deviceAuthorizationClient()],
  });

  const spinner = yoctoSpinner({ text: "Requesting device authorization..." });
  spinner.start();

  try {
    // Request device code
    const { data, error } = await authClient.device.code({
      client_id: clientId,
      scope: "openid profile email",
    });

    spinner.stop();

    if (!data || error) {
      logger.error(
        `Failed to request device authorization: ${error?.error_description || error?.error
        }`
      );
      process.exit(1);
    }

    const {
      device_code,
      user_code,
      verification_uri,
      verification_uri_complete,
      interval = 5,
      expires_in,
    } = data;

    console.log(chalk.cyan("\n🔗 Device Authorization Required"));
    console.log(
      `Visit: ${chalk.underline.blue(
        verification_uri_complete || verification_uri
      )}`
    );
    console.log(`Code: ${chalk.bold.green(user_code)}\n`);

    // Auto-open browser
    const shouldOpen = await confirm({
      message: "Open browser automatically?",
      initialValue: true,
    });

    if (!isCancel(shouldOpen) && shouldOpen) {
      await open(verification_uri_complete || verification_uri);
    }

    console.log(
      chalk.gray(
        `⏳ Waiting for authorization (expires in ${Math.floor(
          expires_in / 60
        )}m)...`
      )
    );

    const token = await pollForToken(
      authClient,
      device_code,
      clientId,
      interval
    );

    if (token) {
      const saved = await storeToken(token);

      if (!saved) {
        console.log(chalk.yellow("⚠️ Warning: Could not save authentication token"));
        console.log(chalk.yellow("You may need to login again on next use."));
      }

      outro(chalk.green("✔ Logged in successfully!"));

      //    Todo : Get the user data
    }
  } catch (err) {
    spinner.stop();
    process.exit(1);
  }
}

// --------------------------------------
//   POLLING FOR TOKEN
// --------------------------------------

async function pollForToken(authClient, deviceCode, clientId, interval) {
  let pollInterval = interval;

  return new Promise((resolve, reject) => {
    const spinner = yoctoSpinner({ text: "", color: "cyan" });
    let dots = 0;

    const poll = async () => {
      dots = (dots + 1) % 4;
      spinner.text = chalk.gray(
        `Polling for authorization ${".".repeat(dots)}${" ".repeat(3 - dots)}`
      );

      if (!spinner.isSpinning) spinner.start();

      try {
        const { data, error } = await authClient.device.token({
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          device_code: deviceCode,
          client_id: clientId,
        });

        if (data?.access_token) {
          spinner.stop();
          resolve(data);
          return;
        }

        if (error) {
          switch (error.error) {
            case "authorization_pending":
              // Keep polling
              break;
            case "slow_down":
              pollInterval += 5;
              break;
            case "access_denied":
              spinner.stop();
              console.error(chalk.red("✖ Access denied."));
              reject(error);
              return;
            case "expired_token":
              spinner.stop();
              console.error(chalk.red("✖ Device code expired."));
              reject(error);
              return;
            default:
              spinner.stop();
              reject(error);
              return;
          }
        }
      } catch (err) {
        spinner.stop();
        reject(err);
        return;
      }

      setTimeout(poll, pollInterval * 1000);
    };

    poll();
  });
}

export async function logoutAction() {
  intro(chalk.bold("👋🏻 Logout"))

  const token = await getStoredToken();

  if (!token) {
    console.log(chalk.yellow("You'r are not logged in"));
    process.exit(0);
  }

  const shouldLogout = await confirm({
    message: "Are you sure you want to logout?",
    initialValue: false
  })

  if (isCancel(shouldLogout) || !shouldLogout) {
    cancel("Loggout Cancelled")
    process.exit(0)
  }

  const cleared = await clearStoredToken();

  if (cleared) {
    outro(chalk.green("✅ Successfully logged out!"))
  } else {
    console.log(chalk.yellow("⚠️ Could not clear token file."))
  }

}



export async function whoamiAction(opts) {
  const token = await requireAuth();

  if (!token?.access_token) {
    console.log("No access token found. Please login.")
    process.exit(1)
  }

  const user = await prisma.user.findFirst({
    where: {
      sessions: {
        some: {
          token: token.access_token,
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    },
  })

  console.log(
    chalk.bold.greenBright(`\n USER: ${user.name}
      📧 EMAIL: ${user.email}
      🆔 ID : ${user.id}`)
  );
}



// --------------------------------------
//  COMMANDER SETUP
// --------------------------------------

export const login = new Command("login")
  .description("Login to Better Auth")
  .option("--server-url <url>", "The Better Auth server URL", URL)
  .option("--client-id <id>", "The OAuth client ID", CLIENT_ID)
  .action(loginAction);


export const logout = new Command("logout")
  .description("Logout and Clear stored credentials")
  .action(logoutAction)

export const whoami = new Command("whoami")
  .description("Show current authenticated user")
  .option("--server-url <url>", "The Better Auth server URL", URL)
  .action(whoamiAction)