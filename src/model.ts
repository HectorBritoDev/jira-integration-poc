import { ChatOpenAI } from "@langchain/openai"
import { LITELLM_API_KEY } from "./config"

export const model = new ChatOpenAI({
  model: "qwen-3.8-27b",
  apiKey: LITELLM_API_KEY,
  configuration: { baseURL: "http://dev.litellm.localhost:8080/" },
})
