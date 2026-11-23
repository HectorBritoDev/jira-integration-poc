import { serve } from "bun";
import { MainResponse } from ".";

const server = serve({
  port: 1234,
  routes: {
    "/": MainResponse()
  }
})


console.log(`Listening on ${server.url}`)
