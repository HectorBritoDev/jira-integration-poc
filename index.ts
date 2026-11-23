import { ChatOpenAI } from "@langchain/openai"
import { tool } from "@langchain/core/tools"
import { HumanMessage, type BaseMessage } from "@langchain/core/messages"
import z from "zod"

// 1. Define the tool: a function + a name, description and input schema.
//    The function receives the parsed input object (matching the schema).
const sayHelloTo = tool(
  ({ name }) => `Epale mi pana ${name}`,
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

// 2. bindTools returns a NEW model instance; it doesn't modify `model`.
const modelWithTools = model.bindTools([sayHelloTo])

// 3. Ask the model. If it decides to use the tool, it returns tool_calls
//    instead of (or alongside) text content.
const messages: BaseMessage[] = [new HumanMessage("my name is hector")]
const aiMessage = await modelWithTools.invoke(messages)
messages.push(aiMessage)

// 4. Run each requested tool call. Invoking a tool with a ToolCall
//    returns a ToolMessage that we send back to the model.
for (const toolCall of aiMessage.tool_calls ?? []) {
  const toolMessage = await sayHelloTo.invoke(toolCall)
  messages.push(toolMessage)
}

// 5. Let the model write its final answer using the tool results.
const finalResponse = await modelWithTools.invoke(messages)

console.log(finalResponse.content)

export const MainResponse = () => {
  return new Response("OK")
}
