import { ChatOpenAI } from "@langchain/openai"
import { MCPAdapter } from "@langchain/mcp-adapters"
import { tool, type StructuredToolInterface } from "@langchain/core/tools"
import { HumanMessage, SystemMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages"
import z from "zod"


// Atlassian credentials come from .env (gitignored, loaded automatically by Bun).
const { ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN } = process.env
if (!ATLASSIAN_EMAIL || !ATLASSIAN_API_TOKEN) {
  throw new Error("Set ATLASSIAN_EMAIL and ATLASSIAN_API_TOKEN in .env")
}

// Basic Auth = "Basic " + base64("email:api_token")
const atlassianAuth = Buffer.from(`${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}`).toString("base64")

const adapter = new MCPAdapter({
  servers: {
    docs: {
      url: "https://docs.langchain.com/mcp"
    },
    atlassian: {
      url: "https://mcp.atlassian.com/v2/mcp?tools=all",
      headers: {
        Authorization: `Basic ${atlassianAuth}`
      }
    }
  }
})

const mcpTooList = await adapter.listTools()
console.log("[debug] MCP tools loaded:", mcpTooList.map((t) => t.name))

const sayHelloTo = tool(
  ({ name }) => `Avlame ${name}, QLQ. Bienvenido`,
  {
    name: "say_hello", // letters, numbers, _ and - only (no spaces)
    description: "Says hello to a given user",
    schema: z.object({
      name: z.string().describe("The name of the user to say hello to"),
    }),
  }
)

const model = new ChatOpenAI({
  model: "qwen-3.8-27b",
  apiKey: process.env.LITELLM_API_KEY,
  configuration: { baseURL: "http://dev.litellm.localhost:8080/" },
})


const toolList: StructuredToolInterface[] = [sayHelloTo, ...mcpTooList]

const modelWithTools = model.bindTools(toolList)

// The Atlassian tools require a cloudId (site UUID, hostname or URL), and no loaded tool can look it up.
const ATLASSIAN_SITE = "poc-velx.atlassian.net"
const JIRA_PROJECT_KEY = "KAN"

const messages: BaseMessage[] = [
  new SystemMessage(
    `Our Atlassian site is ${ATLASSIAN_SITE}. Always pass it as the "cloudId" argument to Atlassian tools. ` +
    `Our Jira project key is ${JIRA_PROJECT_KEY}; only consider issues from that project.`
  ),
  new HumanMessage("my name is hector, I want to know how many tickets to I have in TODO?"),
]

// Each atlassian_search call can spend Rovo credits, so cap how many tool rounds the model gets.
const MAX_TOOL_ROUNDS = 5

let aiMessage = await modelWithTools.invoke(messages)
messages.push(aiMessage)

for (let round = 0; aiMessage.tool_calls?.length && round < MAX_TOOL_ROUNDS; round++) {
  // console.log("[debug] Tool calls requested by the model:", JSON.stringify(aiMessage.tool_calls, null, 2))

  for (const toolCall of aiMessage.tool_calls) {
    // console.log(`[debug] Model asked for tool "${toolCall.name}" with args`, toolCall.args)
    const toolToExecute = toolList.find(tool => toolCall.name === tool.name)
    if (!toolToExecute) {
      // Every tool call needs a reply, so tell the model the tool doesn't exist.
      messages.push(new ToolMessage({
        tool_call_id: toolCall.id ?? "",
        content: `Error: tool "${toolCall.name}" does not exist`,
      }))
      continue
    }
    // console.log(`[debug] Code is invoking tool "${toolToExecute.name}"`)
    try {
      messages.push(await toolToExecute.invoke(toolCall))
    } catch (err) {
      // Report the failure back to the model instead of crashing, so it can fix its arguments.
      messages.push(new ToolMessage({
        tool_call_id: toolCall.id ?? "",
        content: `Error: ${(err as Error).message}`,
      }))
    }
  }

  aiMessage = await modelWithTools.invoke(messages)
  messages.push(aiMessage)
}

if (aiMessage.tool_calls?.length) {
  console.warn(`[warn] Stopped after ${MAX_TOOL_ROUNDS} tool rounds; the model still wanted more tools.`)
}

console.log(aiMessage.content)

export const MainResponse = () => {
  return new Response("OK")
}
