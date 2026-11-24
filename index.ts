import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { runAgent } from "./src/agent"
import { loadMcpTools } from "./src/mcp"
import { model } from "./src/model"
import { SYSTEM_PROMPT } from "./src/prompts"
import { jiraTools } from "./src/tools/jira"

const tools = [...jiraTools, ...(await loadMcpTools())]

const answer = await runAgent(model, tools, [
  new SystemMessage(SYSTEM_PROMPT),
  new HumanMessage("my name is hector, I want to know how many tickets to I have in TODO?"),
])

console.log(answer.content)

export const MainResponse = () => {
  return new Response("OK")
}
