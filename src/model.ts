import { ChatOpenAI } from "@langchain/openai"
import { LITELLM_API_KEY, LITELLM_BASE_URL, LITELLM_MODEL } from "./config"

export const model = new ChatOpenAI({
  model: LITELLM_MODEL,
  apiKey: LITELLM_API_KEY,
  configuration: { baseURL: LITELLM_BASE_URL },
})
