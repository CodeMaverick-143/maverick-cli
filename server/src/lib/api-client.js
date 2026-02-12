import { getStoredToken } from "./token.js";

const BASE_URL = "https://maverick-cli.onrender.com";

async function getAuthHeaders() {
    const token = await getStoredToken();
    if (!token?.access_token) {
        throw new Error("Not authenticated. Please run 'maverick login' first.");
    }
    return {
        "Authorization": `Bearer ${token.access_token}`,
        "Content-Type": "application/json"
    };
}

async function request(method, path, body = null) {
    const headers = await getAuthHeaders();
    const options = { method, headers };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${path}`, options);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `API error: ${res.status}`);
    }

    return res.json();
}

export const apiClient = {
    /** Get current user from token */
    async getUser() {
        return request("GET", "/api/cli/user");
    },

    /** Create a new conversation */
    async createConversation(mode = "chat", title = null) {
        return request("POST", "/api/cli/conversations", { mode, title });
    },

    /** Get a conversation by ID (with messages) */
    async getConversation(conversationId) {
        return request("GET", `/api/cli/conversations/${conversationId}`);
    },

    /** Update conversation title */
    async updateTitle(conversationId, title) {
        return request("PUT", `/api/cli/conversations/${conversationId}/title`, { title });
    },

    /** Get messages for a conversation */
    async getMessages(conversationId) {
        return request("GET", `/api/cli/conversations/${conversationId}/messages`);
    },

    /** Create a message in a conversation */
    async createMessage(conversationId, role, content) {
        return request("POST", `/api/cli/conversations/${conversationId}/messages`, { role, content });
    }
};
