import "dotenv/config";
import express from "express";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import cors from "cors";
import { auth } from "./lib/auth.js"

const app = express()

app.set('trust proxy', true);

// *----------- CORS --------------*
app.use(
    cors({
        origin: "https://maverick-cli.vercel.app",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

app.options("/{*splat}", cors()); // Handle preflight requests explicitly

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
    res.redirect(`https://maverick-cli.vercel.app/device?user_code=${user_code}`)
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

// GET /api/cli/user — get current user from token
app.get("/api/cli/user", authenticateToken, (req, res) => {
    res.json(req.user);
});

// POST /api/cli/conversations — create a conversation
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

// GET /api/cli/conversations/:id — get a conversation with messages
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

// PUT /api/cli/conversations/:id/title — update conversation title
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

// GET /api/cli/conversations/:id/messages — get messages
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

// POST /api/cli/conversations/:id/messages — create a message
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

app.listen(process.env.PORT, () => {
    console.log(`running on PORT : http://localhost:${process.env.PORT}`)
})
