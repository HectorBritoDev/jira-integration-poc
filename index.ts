import { startChat } from "./src/chat"
import { loadMcpTools } from "./src/mcp"
import { model } from "./src/model"
import { SYSTEM_PROMPT } from "./src/prompts"
import { jiraTools } from "./src/tools/jira"

// Add jiraTools to use the SDK
const tools = [...(await loadMcpTools())]

await startChat({
  model,
  tools,
  systemPrompt: SYSTEM_PROMPT,
  firstMessage: "my name is hector, I want to know how many tickets to I have in TODO?",
})

export const MainResponse = () => {
  return new Response("OK")
}
