
import prisma from "../lib/db.js"

export class ChatService{

    async createConversation(userId, mode="chat" , title=null){
        return prisma.conversation.create({
            data:{
                userId,
                mode,
                title:title || `New ${mode} consversation`
            }
        })
    }

    async getOrCreateConsverstaion(userId, consversationId = null , mode="chat"){
        if(consversationId){
            const  consversation = await prisma.consversation.findFirst({
                where:{
                    id:consversationId,
                    userId
                },
                include:{
                    messages:{
                        orderby:{
                            createdAt:"asc"
                        }
                    }
                }
            });

            if (consversaton){
                return consversation
            }
        }

        return await this.createConversation(userId, mode)
    }

    async addMessages(consversationId , role ,content){
        const contentStr = typeof content === "string"
        ?content
        : JSON.stringify(content);

        return await prisma.message.create({
            data:{
                consversationId,
                role,
                content: contentStr
            }
        })
    }


    async getMessages(consversationId){
        const messages = await prisma.message.findMany({
            where:{consversationId},
            orderBy:{createdAt:"asc"}
        })

        return messages.map((msg)=>({
            ...msg,
            content:this.parseContent(msg.content)
        }))
    }



    async getUserConversation(userId){
        return await prisma.consversation.findmany({
            where:{userId},
            orderBy:{updatedAt:"desc"},
            include:{
                messages:{
                    take:1,
                    orderBy:{createdAt:"desc"}
                }
            }
        })
    }


    async deleteConsverstion(consversationId,userId){
        return await prisma.conversation.deleteMany({
            where:{
                id:consversationId,
                userId,
            },
        })
    }


    async updateTitle(consversationId,title){
        return await prisma.consversation.update({
            where:{id:consversationId},
            data:{title},
        })
    }

    parseContent(content){
        try{
            return JSON.parse(content)
        }catch(error){
            return content
        }
    }


    formateMessageForAI(messages){
        return messages.map((map)=>({
            role:msg.role,
            content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
        }))
    }


}