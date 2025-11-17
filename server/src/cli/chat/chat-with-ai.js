import chalk from "chalk";
import boxen from "boxen";
import {text,isCancel,cancel,intro,outro} from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";
import {marked} from "marked";
import {markedTerminal} from "marked-terminal"
import {AIService} from "../ai/google-service.js";
import { ChatService } from "../../service/chat.service.js";
import {getStoredToken} from "../commands/auth/login.js"
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


async function getUserFromToken(){
    const token = await getStoredToken()
    if(!token?.access_token){
        throw new Error("Not authenticated. Please run 'maverick login' first.")
    }
    const spinner = yoctoSpinner({text:"Authenticating...."}).start();
    const user = await prisma.user.findFirst({
        where:{
            sessions:{
                some:{token: token.access_token}
            }
        }
    });

    if(!user){
        spinner.error("User not found");
        throw new Error("User not found. Please login again")
    }

    spinner.success(`Welcome back, ${user.name}!`)
    return user;
}


async function initConversation(userId,conversationId=null , mode="chat"){
    const spinner = yoctoSpinner({text:"Loading conversation...."}).start()

    const conversation = await chatService.getOrCreateConsverstaion(
        userId,
        conversationId,
        mode
    )

    spinner.success("Conversation Loaded")

    const conversationInfo = boxen(
        `${chalk.bold("Conversation")} : ${conversation.title} \n ${chalk.gray("ID: " + conversation.id)} \n ${chalk.gray("Mode: " + conversation.mode)}`,{
            padding:1,
            margin:{top:1,bottom:1},
            borderStyle:"round",
            borderColor:"cyan",
            title:"💬 Chat Session",
            titleAlignment:"center"
        }
    );


    console.log(conversationInfo)

    if(conversation.message?.length > 0){
        console.log(chalk.yellow(" Previous messages: \n"));
        displayMessages(conversation.messages);
    }

    return conversation
}



export async function startChat(mode="chat",conversationId=null){
    try{
        intro(
            boxen(chalk.bold.cyan("Maverick AI Chat"),{
                padding:1,
                borderStyle:"double",
                borderColor:"cyan"
            })
        )

        const user = await getUserFromToken()
        const conversation = await initConversation(user.id , conversationId,mode);
        await chatLoop(conversation)

        outro(chalk.green('⚡️ Thanks For Chatting.....'))

    }catch(error){
        const errorBox = boxen(chalk.red(`Error: ${error.message}`),{
            padding:1,
            margin:1,
            borderStyle:"round",
            borderColor:"red",
        })

    }
}


