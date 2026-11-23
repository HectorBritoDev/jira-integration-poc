import { serve } from "bun";

const server = serve({
  port: 3000,
  routes: {
    "/": new Response("Welcome to bun")
  }
})


console.log(`Listening on ${server.url}`)
