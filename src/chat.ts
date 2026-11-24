import type { ChatOpenAI } from "@langchain/openai"
import type { StructuredToolInterface } from "@langchain/core/tools"
import { HumanMessage, type BaseMessage } from "@langchain/core/messages"
import { runAgent } from "./agent"

const EXIT_COMMANDS = new Set(["exit", "quit"])

type ChatOptions = {
  model: ChatOpenAI
  tools: StructuredToolInterface[]
  /** Sent automatically before the user types anything, so there's something to look at right away. */
  firstMessage: string
}

/**
 * Terminal chat: sends `firstMessage`, prints the answer, then reads the user's replies from stdin
 * until they type "exit"/"quit" or press Ctrl+D. The whole history is kept, so the model remembers earlier turns.
 */
export async function startChat({ model, tools, firstMessage }: ChatOptions) {
  const history: BaseMessage[] = []

  const reply = async (text: string) => {
    history.push(new HumanMessage(text))
    try {
      const answer = await runAgent(model, tools, history)
      console.log(`\nAI: ${answer.text.trim()}\n`)
    } catch (err) {
      // Keep the chat alive (e.g. if the model endpoint hiccups); the user can just try again.
      console.error(`\n[error] ${(err as Error).message}\n`)
    }
  }

  console.log(`Type a reply and press Enter. "exit", "quit" or Ctrl+D ends the chat.\n`)
  console.log(`You: ${firstMessage}`)
  await reply(firstMessage)

  process.stdout.write("You: ")
  // Bun yields stdin one line at a time; the loop ends on Ctrl+D (end of input).
  for await (const line of console) {
    const text = line.trim()
    if (EXIT_COMMANDS.has(text.toLowerCase())) break
    if (text) await reply(text)
    process.stdout.write("You: ")
  }
}
