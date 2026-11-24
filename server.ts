import { serve } from "bun";
import { handleRedirection } from "./src/oauth/callback";
import { CLIENT_ID, REDIRECT_URI, STATE, urlToAuth } from "./redirect";

const CLIENT_SECRET = process.env.ATLASSIAN_CLIENT_SECRET;
if (!CLIENT_SECRET) {
  throw new Error("Set ATLASSIAN_CLIENT_SECRET in .env");
}

console.log(urlToAuth)

const server = serve({
  port: 1234,
  routes: {
    "/oauth/callback": async req => {
      const params = new URL(req.url).searchParams;
      const code = params.get("code");

      if (!code) {
        return new Response("Missing code", { status: 400 });
      }

      const tokenResponse = await fetch("https://auth.atlassian.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        return new Response(await tokenResponse.text(), { status: 502 });
      }

      const tokenData = await tokenResponse.json();
      return new Response(tokenData.access_token);
    },
  }
})


console.log(`Listening on ${server.url}`)
