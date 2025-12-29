import { createAuthClient } from "better-auth/react";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: "https://maverick-cli-backend.onrender.com",
    plugins: [
        deviceAuthorizationClient()
    ]
})