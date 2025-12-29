import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import { config } from "../../config/google.config.js";
import chalk from "chalk"


export class AIService {
    constructor() {
        if (!config.googleApiKey) {
            throw new Error("GOOGLE_API_KEY is not set in env")
        }

        this.model = google(config.model, {
            apiKey: config.googleApiKey,
        })
    }



    async sendMessage(messages, onChunk, tools = undefined, onToolCall = null) {
        try {
            const streamConfig = {
                model: this.model,
                messages: messages,
            }

            if (tools && Object.keys(tools).length > 0) {
                streamConfig.tools = tools;
                streamConfig.maxSteps = 5 // Allow up to 5 tool calls steps

                console.log(chalk.gray(`[DEBUG] Tools enabled : ${Object.keys(tools).join(", ")}`))
            }



            const result = streamText(streamConfig);
            let fullResponse = " "

            for await (const chunk of result.textStream) {
                fullResponse += chunk;
                if (onChunk) {
                    onChunk(chunk)
                }
            }

            const fullResult = result;
            const toolCalls = [];
            const toolResults = []

            if (fullResult.steps && Array.isArray(fullResult.steps)) {
                for (const step of fullResult.steps) {
                    if (step.toolCall && step.toolCall.lenght > 0) {
                        for (const toolCall of step.toolCalls) {
                            toolCalls.push(toolCall)

                            if (onToolCall) {
                                onToolCall(toolCall)
                            }
                        }
                    }

                    if (step.toolResult && step.toolResult.length > 0) {
                        toolResults.push(toolResult)
                    }
                }
            }


            return {
                content: fullResponse,
                finishResponse: fullResult.finishResponse,
                usage: fullResult.usage,
                toolCalls,
                toolResults,
                steps: fullResult.steps
            }

        } catch (error) {

            console.error(chalk.red("AI Service Error:"), error.message);
            throw error;
        }
    }

    async getMessage(messages, tools = undefined) {
        let fullResponse = "";

        const result = await this.sendMessage(messages, (chunk) => {
            fullResponse += chunk
        }, tools)

        return result.content


    }



}