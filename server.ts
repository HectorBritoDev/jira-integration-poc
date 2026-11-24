import { serve } from "bun";
import { handleRedirection } from "./src/oauth/callback";
import { urlToAuth } from "./redirect";

console.log(urlToAuth)

const server = serve({
  port: 1234,
  routes: {
    "/oauth/callback": handleRedirection,
  }
})


console.log(`Listening on ${server.url}`)
