import type { ChatOpenAI } from "@langchain/openai"
import type { StructuredToolInterface } from "@langchain/core/tools"
import { ToolMessage, type BaseMessage } from "@langchain/core/messages"
import type { ToolCall } from "@langchain/core/messages/tool"

// Each atlassian_search call can spend Rovo credits, so cap how many tool rounds the model gets.
const MAX_TOOL_ROUNDS = 5

/**
 * Calls the model, runs every tool it asks for, and repeats until it answers
 * without tool calls (or MAX_TOOL_ROUNDS is reached). Returns the last model message.
 *
 * Every model reply and tool result is appended to `history`, so the caller can keep the conversation going.
 */
export async function runAgent(model: ChatOpenAI, tools: StructuredToolInterface[], history: BaseMessage[]) {
  const modelWithTools = model.bindTools(tools)

  let aiMessage = await modelWithTools.invoke(history)
  history.push(aiMessage)

  for (let round = 0; aiMessage.tool_calls?.length && round < MAX_TOOL_ROUNDS; round++) {
    // console.log("[debug] Tool calls requested by the model:", JSON.stringify(aiMessage.tool_calls, null, 2))
    for (const toolCall of aiMessage.tool_calls) {
      history.push(await runToolCall(tools, toolCall))
    }

    aiMessage = await modelWithTools.invoke(history)
    history.push(aiMessage)
  }

  if (aiMessage.tool_calls?.length) {
    console.warn(`[warn] Stopped after ${MAX_TOOL_ROUNDS} tool rounds; the model still wanted more tools.`)
    // The API rejects a history with unanswered tool calls, which would break the next turn of the chat.
    for (const toolCall of aiMessage.tool_calls) {
      history.push(new ToolMessage({
        tool_call_id: toolCall.id ?? "",
        content: `Error: not run, the limit of ${MAX_TOOL_ROUNDS} tool rounds per reply was reached`,
      }))
    }
  }

  return aiMessage
}

// Every tool call needs a reply, so failures are returned to the model as a ToolMessage instead of thrown.
async function runToolCall(tools: StructuredToolInterface[], toolCall: ToolCall): Promise<BaseMessage> {
  // console.log(`[debug] Model asked for tool "${toolCall.name}" with args`, toolCall.args)
  const toolToExecute = tools.find((tool) => tool.name === toolCall.name)
  if (!toolToExecute) {
    return new ToolMessage({
      tool_call_id: toolCall.id ?? "",
      content: `Error: tool "${toolCall.name}" does not exist`,
    })
  }

  try {
    return await toolToExecute.invoke(toolCall)
  } catch (err) {
    // Lets the model see what went wrong (e.g. bad arguments) and retry.
    return new ToolMessage({
      tool_call_id: toolCall.id ?? "",
      content: `Error: ${(err as Error).message}`,
    })
  }
}
