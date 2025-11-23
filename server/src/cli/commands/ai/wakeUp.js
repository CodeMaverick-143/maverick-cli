import chalk from "chalk";
import { Command } from "commander";
import yoctoSpinner from "yocto-spinner"
import { requireAuth } from "../../../lib/token.js";
import prisma from "../../../lib/db.js";
import { select } from "@clack/prompts";
import { startChat } from "../../chat/chat-with-ai.js";

const wakeUpAction = async () => {
    const token = await requireAuth();

    const spinner = yoctoSpinner({ text: "Fetching user information....." })
    spinner.start()


    const user = await prisma.user.findFirst({
        where: {
            sessions: {
                some: {
                    token: token.access_token
                }
            }
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true
        }

    });

    spinner.stop()

    if (!user) {
        console.log(chalk.red("User not found"))
        return;
    }

    console.log(chalk.green(`Welcome back, ${user.name}! \n`))

    const choice = await select({
        message: "Select an option:",
        options: [
            {
                value: "chat",
                label: "Chat",
                hint: "Simple chat with AI"
            },
            {
                value: "tool",
                label: "Tool Calling",
                hint: "Chat with tools (Google Search, Code Execution)"
            },
            {
                value: "agent",
                label: "Agent",
                hint: "Advanced AI agent (coming soon)"
            },
        ],
    })

    switch (choice) {
        case "chat":
            console.log("chat is selected")
            await startChat("chat")
            break;
        case "tool":
            console.log(chalk.green("Tool calling is selected"))
            break;
        case "agent":
            console.log(chalk.yellow("Agentic mode coming soon"))
            break;

    }



}

export const wakeup = new Command("wakeup")
    .description("wake up the ai")
    .action(wakeUpAction)