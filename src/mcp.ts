import { MCPAdapter } from "@langchain/mcp-adapters"
import { ATLASSIAN_ACCESS_TOKEN } from "./config"

const adapter = new MCPAdapter({
  servers: {
    docs: {
      url: "https://docs.langchain.com/mcp"
    },
    atlassian: {
      url: "https://mcp.atlassian.com/v2/mcp",
      headers: {
        Authorization: `Bearer ${ATLASSIAN_ACCESS_TOKEN}`
      }
    }
  }
})

export async function loadMcpTools() {
  const tools = await adapter.listTools()
  console.log("[debug] MCP tools loaded:", tools.map((t) => t.name))
  return tools
}
