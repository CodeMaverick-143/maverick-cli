import { createAuthClient } from "better-auth/react";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://maverick-cli.onrender.com",
    plugins: [
        deviceAuthorizationClient()
    ]
})