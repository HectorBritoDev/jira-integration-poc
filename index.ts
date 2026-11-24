import { ChatOpenAI } from "@langchain/openai"
import { MCPAdapter } from "@langchain/mcp-adapters"
import { tool, type StructuredToolInterface } from "@langchain/core/tools"
import { HumanMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages"
import z from "zod"


const adapter = new MCPAdapter({
  servers: {
    docs: {
      url: "https://docs.langchain.com/mcp"
    }
  }
})

const mcpTooList = await adapter.listTools()
// console.log("[debug] MCP tools loaded:", mcpTooList.map((t) => t.name))

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

const messages: BaseMessage[] = [new HumanMessage("my name is hector, I want to know how many provider do langchain support?")]
const aiMessage = await modelWithTools.invoke(messages)
messages.push(aiMessage)

// console.log("[debug] Tool calls requested by the model:", JSON.stringify(aiMessage.tool_calls, null, 2))

for (const toolCall of aiMessage.tool_calls ?? []) {
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
  const toolResponse = await toolToExecute.invoke(toolCall)
  messages.push(toolResponse)
}

const finalResponse = await modelWithTools.invoke(messages)

console.log(finalResponse.content)






export const MainResponse = () => {
  return new Response("OK")
}
