import "dotenv/config";
import express from "express";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { createServer } from "node:http";

let httpServerHandler;
try {
    const mod = await import("cloudflare:node");
    httpServerHandler = mod.httpServerHandler;
} catch (e) {

}

import cors from "cors";
import { auth } from "./lib/auth.js"

const app = express()

app.set('trust proxy', true);

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "https://maverick-cli.vercel.app",
    "https://maverick.auth.xplnhub.tech"
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
};

app.use(cors(corsOptions));
app.options("/{*splat}", cors(corsOptions));

app.all("/api/auth/*splat", toNodeHandler(auth))

app.use(express.json());

app.get("/api/me", async (req, res) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    return res.json(session);
})
app.head('/', (req, res) => {
    res.status(200).end();
});


app.get("/device", async (req, res) => {
    const { user_code } = req.query
    res.redirect(`${process.env.CLIENT_URL || "https://maverick.auth.xplnhub.tech"}/device?user_code=${user_code}`)
})


app.get('/health', (req, res) => {
    res.send("Backend is running")
})


async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: "Missing authorization token" });
    }

    try {
        const { default: prisma } = await import("./lib/db.js");
        const user = await prisma.user.findFirst({
            where: {
                sessions: {
                    some: { token }
                }
            },
            select: { id: true, name: true, email: true, image: true }
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth middleware error:", err.message);
        return res.status(500).json({ error: "Authentication failed" });
    }
}

app.get("/api/cli/user", authenticateToken, (req, res) => {
    res.json(req.user);
});

app.post("/api/cli/conversations", authenticateToken, async (req, res) => {
    try {
        const { default: prisma } = await import("./lib/db.js");
        const { mode = "chat", title } = req.body || {};
        const conversation = await prisma.conversation.create({
            data: {
                userId: req.user.id,
                mode,
                title: title || `New ${mode} conversation`
            }
        });
        res.json(conversation);
    } catch (err) {
        console.error("Create conversation error:", err.message);
        res.status(500).json({ error: "Failed to create conversation" });
    }
});

app.get("/api/cli/conversations/:id", authenticateToken, async (req, res) => {
    try {
        const { default: prisma } = await import("./lib/db.js");
        const conversation = await prisma.conversation.findFirst({
            where: { id: req.params.id, userId: req.user.id },
            include: {
                messages: { orderBy: { createdAt: "asc" } }
            }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        res.json(conversation);
    } catch (err) {
        console.error("Get conversation error:", err.message);
        res.status(500).json({ error: "Failed to get conversation" });
    }
});

app.put("/api/cli/conversations/:id/title", authenticateToken, async (req, res) => {
    try {
        const { default: prisma } = await import("./lib/db.js");
        const { title } = req.body;
        const conversation = await prisma.conversation.update({
            where: { id: req.params.id },
            data: { title }
        });
        res.json(conversation);
    } catch (err) {
        console.error("Update title error:", err.message);
        res.status(500).json({ error: "Failed to update title" });
    }
});

app.get("/api/cli/conversations/:id/messages", authenticateToken, async (req, res) => {
    try {
        const { default: prisma } = await import("./lib/db.js");
        const messages = await prisma.message.findMany({
            where: { conversationId: req.params.id },
            orderBy: { createdAt: "asc" }
        });
        res.json(messages);
    } catch (err) {
        console.error("Get messages error:", err.message);
        res.status(500).json({ error: "Failed to get messages" });
    }
});

app.post("/api/cli/conversations/:id/messages", authenticateToken, async (req, res) => {
    try {
        const { default: prisma } = await import("./lib/db.js");
        const { role, content } = req.body;
        const contentStr = typeof content === "string" ? content : JSON.stringify(content);
        const message = await prisma.message.create({
            data: {
                conversationId: req.params.id,
                role,
                content: contentStr
            }
        });
        res.json(message);
    } catch (err) {
        console.error("Create message error:", err.message);
        res.status(500).json({ error: "Failed to create message" });
    }
});

if (process.env.NODE_ENV !== "production") {
    app.listen(process.env.PORT, () => {
        console.log(`running on PORT : http://localhost:${process.env.PORT}`)
    })
}

const server = createServer(app);

export default httpServerHandler ? httpServerHandler(server) : server;
