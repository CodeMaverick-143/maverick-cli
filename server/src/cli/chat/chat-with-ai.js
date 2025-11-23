import chalk from "chalk";
import boxen from "boxen";
import { text, isCancel, cancel, intro, outro } from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal"
import { AIService } from "../ai/google-service.js";
import { ChatService } from "../../service/chat.service.js";
import { getStoredToken } from "../../lib/token.js"
import prisma from "../../lib/db.js";
import { yo } from "zod/v4/locales";

marked.use(
    markedTerminal({
        code: chalk.cyan,
        blockquote: chalk.gray.italic,
        heading: chalk.green.bold,        // all headings
        firstHeading: chalk.green.bold.underline, // H1 specifically
        hr: chalk.gray,                   // horizontal rules
        listitem: chalk.white,            // bullet items
        list: chalk.white,                // list container
        paragraph: chalk.white,           // paragraphs
        strong: chalk.bold,               // **bold**
        em: chalk.italic,                 // *italic*
        codespan: chalk.bgBlack.white,    // inline code
        del: chalk.strikethrough,         // ~~strikethrough~~
        link: chalk.blue,                 // markdown link text
        href: chalk.underline.blue,       // link href (actual URL)
    })
);


const aiService = new AIService();
const chatService = new ChatService();


async function getUserFromToken() {
    const token = await getStoredToken()
    if (!token?.access_token) {
        throw new Error("Not authenticated. Please run 'maverick login' first.")
    }
    const spinner = yoctoSpinner({ text: "Authenticating...." }).start();
    const user = await prisma.user.findFirst({
        where: {
            sessions: {
                some: { token: token.access_token }
            }
        }
    });

    if (!user) {
        spinner.error("User not found");
        throw new Error("User not found. Please login again")
    }

    spinner.success(`Welcome back, ${user.name}!`)
    return user;
}


async function initConversation(userId, conversationId = null, mode = "chat") {
    const spinner = yoctoSpinner({ text: "Loading conversation...." }).start()

    const conversation = await chatService.getOrCreateConversation(
        userId,
        conversationId,
        mode
    )

    spinner.success("Conversation Loaded")

    const conversationInfo = boxen(
        `${chalk.bold("Conversation")} : ${conversation.title} \n ${chalk.gray("ID: " + conversation.id)} \n ${chalk.gray("Mode: " + conversation.mode)}`, {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: "round",
        borderColor: "cyan",
        title: "💬 Chat Session",
        titleAlignment: "center"
    }
    );


    console.log(conversationInfo)

    if (conversation.message?.length > 0) {
        console.log(chalk.yellow(" Previous messages: \n"));
        displayMessages(conversation.messages);
    }

    return conversation
}


function displayMessages(messages) {
    messages.forEach(message => {
        if (message.role === "user") {
            const userBox = boxen(chalk.white(message.content), {
                padding: 1,
                margin: { top: 1, bottom: 1, left: 2, right: 2 },
                borderStyle: "round",
                borderColor: "cyan",
                title: "You",
                titleAlignment: "left"
            })
            console.log(userBox)
        } else {
            const renderContent = marked.parse(message.content)
            const assistantBox = boxen(chalk.white(renderContent.trim()), {
                padding: 1,
                margin: { top: 1, bottom: 1, left: 2, right: 2 },
                borderStyle: "round",
                borderColor: "cyan",
                title: "Assistant",
                titleAlignment: "right"
            })
            console.log(assistantBox)
        }
    });
}


async function saveMessage(conversationId, role, content) {
    const message = await chatService.createMessage(conversationId, role, content)
    return message
}



async function getAIResponse(conversationId) {
    const spinner = yoctoSpinner({ text: "Thinking...", color: "yellow" }).start();
    const dbMessages = await chatService.getMessages(conversationId)
    const aiMessages = chatService.formatMessagesForAI(dbMessages)

    let fullResponse = ""

    let isFirstChunk = true

    try {

        const result = await aiService.sendMessage(aiMessages, (chunk) => {
            if (isFirstChunk) {

                spinner.stop();
                console.log("\n")
                const header = chalk.green.bold("Assistant: ")
                console.log(header)
                console.log(chalk.gray("-".repeat(60)))
                isFirstChunk = false

            }

            fullResponse += chunk
        });


        console.log("\n");
        const renderedMarkedown = marked.parse(fullResponse)
        console.log(renderedMarkedown)
        console.log(chalk.gray("-".repeat(60)))
        console.log("\n")

        return result.content;

    } catch (error) {
        spinner.error("Error getting AI response:")
        throw error
    }
}




async function updateConversationTitle(conversationId, userInput, messageCount) {
    if (messageCount === 1) {
        const spinner = yoctoSpinner({ text: "Updating conversation title...." }).start();
        const title = userInput.slice(0, 50) + (userInput.length > 50 ? "..." : "");
        await chatService.updateConversationTitle(conversationId, title)
        spinner.success("Conversation title updated")
    }
}


const chatLoop = async (conversation) => {
    try {

        const helpBox = boxen(`${chalk.gray(' • Type your messgae and press enter')}\n${chalk.gray(' • Markdown formatting is supported in responses')}\n${chalk.gray('• Type "exit" to end the conversation')}\n${chalk.gray('• press Ctrl+C to exit')}`,
            {
                padding: 1,
                margin: 1,
                borderStyle: "round",
                borderColor: "cyan",
                title: "Help",
                titleAlignment: "center",
                dimBorder: true
            })
        console.log(helpBox)
        while (true) {
            const userInput = await text({
                message: chalk.blue("Your Message...."),
                placeholder: "Type your message here...",
                validate(value) {
                    if (value.trim() === "") return "Message cannot be empty"
                }

            })

            if (isCancel(userInput)) {
                const exitBox = boxen(chalk.yellow("Chat session ended. GoodBye! "), {
                    padding: 1,
                    margin: 1,
                    borderStyle: "round",
                    borderColor: "cyan",
                    title: "GoodBye",
                    titleAlignment: "center",
                    dimBorder: true
                })
                console.log(exitBox)
                process.exit(0)
            }


            if (userInput.trim().toLowerCase() === "exit") {
                const exitBox = boxen(chalk.yellow("Chat session ended. GoodBye! "), {
                    padding: 1,
                    margin: 1,
                    borderStyle: "round",
                    borderColor: "cyan",
                    title: "GoodBye",
                    titleAlignment: "center",
                    dimBorder: true
                })
                console.log(exitBox)
                break
            }

            await saveMessage(conversation.id, "user", userInput)

            const message = await chatService.getMessages(conversation.id)

            const aiResponse = await getAIResponse(conversation.id)

            await saveMessage(conversation.id, "assistant", aiResponse)

            await updateConversationTitle(conversation.id, userInput, message.length)

        }

    } catch (error) {
        const errorBox = boxen(chalk.red(`Error: ${error.message}`), {
            padding: 1,
            margin: 1,
            borderStyle: "round",
            borderColor: "red",
            title: "Error",
            titleAlignment: "center",
            dimBorder: true
        })
        console.log(errorBox)
        process.exit(1)
    }
}



export async function startChat(mode = "chat", conversationId = null) {
    try {
        intro(
            boxen(chalk.bold.cyan("Maverick AI Chat"), {
                padding: 1,
                borderStyle: "double",
                borderColor: "cyan"
            })
        )

        const user = await getUserFromToken()
        const conversation = await initConversation(user.id, conversationId, mode);
        await chatLoop(conversation)

        outro(chalk.green('⚡️ Thanks For Chatting.....'))

    } catch (error) {
        const errorBox = boxen(chalk.red(`Error: ${error.message}`), {
            padding: 1,
            margin: 1,
            borderStyle: "round",
            borderColor: "red",
        })

    }
}


