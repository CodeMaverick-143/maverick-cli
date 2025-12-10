import { google } from "@ai-sdk/google";
import chalk from "chalk";

export const availableTools = [
    {
        id: "google_search",
        name: "Google Search",
        description: "Search the web using Google Search",
        getTool: () => google({}),
        enabled: true,
    },
    {
        id: 'code_execution',
        name: 'Code Execution',
        description: 'Generate and execute python code to perform calculations, solve problems, or provide accurate results.',
        getTool: () => google.tools.codeExecution({}),
        enabled: true,
    },
    {
        id: 'url_context',
        name: 'URL Context',
        description: 'Provide specific URLs that you want to analyse directly from the propmt. Suports upto 20 URLs per request.',
        getTool: () => google.tools.urlContext({}),
        enabled: true,
    }

]



export function getEnabledTools() {
    tools = {}
    try {
        for (const tool of availableTools) {
            if (tool.enabled) {
                tools[tool.id] = tool.getTool()
            }
        }
        if (Object.keys(tools).length > 0) {
            console.log(chalk.green(`[DEBUG] Enabled ${Object.keys(tools).join(", ")}`))
        } else {
            console.log(chalk.yellow(`[DEBUG] No tools enabled`))
        }

        return Object.keys(tools).length > 0 ? tools : undefined
    } catch (error) {
        console.error(chalk.red("Error getting enabled tools"), error)
        console.error(chalk.red(`[ERROR] Error getting enabled tools`), error.message)
        console.error(chalk.yellow('Make sure you have @ai-sdk/google version 2.0+ installed'))
        console.error(chalk.yellow('You can install it using npm install @ai-sdk/google@latest'))
        return undefined
    }

}


export function toggeleTool(toolsId) {

    const tool = availableTools.find(t => t.id === toolsId)

    if (tool) {
        tool.enabled = !tool.enabled
        console.log(chalk.gray(`[DEBUG] Tool ${toolId} toggled to ${tool.enabled}`))

        return tool.enabled
    }

    console.log(chalk.red(`[ERROR] Tool ${toolId} not found`))

    return false;
}


export function emableTools(toolsId) {

    console.log(chalk.gray('[DEBUG] enableTools called with:'), toolsId)

    availableTools.forEach(tool => {
        const wasEnabled = tool.enabled

        tool.enabled = toolsId.includes(tool.id)

        if (tool.enabled !== wasEnabled) {
            console.log(chalk.gray(`[DEBUG] Tool ${tool.id} ${wasEnabled} -> ${tool.enabled}`))

        }
    })

    const enabledCount = availableTools.filter(t => t.enabled).length;
    console.log(chalk.gray(`[DEBUG] Enabled ${enabledCount}/${availableTools.length} tools`))


}


export function getEnabledToolNames() {
    const enabledTools = availableTools.filter(t => t.enabled).map(t => t.name)
    console.log(chalk.gray('[DEBUG] getEnabledToolNames returning:'), names);
    return names
}

export function resetTools() {
    availableTools.forEach(tool => tool.enabled = false);

    console.log(chalk.gray('[DEBUG] ALl tools have been reset (disabled)'))
}