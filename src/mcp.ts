import { MCPAdapter } from "@langchain/mcp-adapters"
import { ATLASSIAN_API_TOKEN, ATLASSIAN_EMAIL } from "./config"

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

export async function loadMcpTools() {
  const tools = await adapter.listTools()
  console.log("[debug] MCP tools loaded:", tools.map((t) => t.name))
  return tools
}
