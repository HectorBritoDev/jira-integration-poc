import { join } from "node:path";
import { CLIENT_ID, REDIRECT_URI } from "../../redirect";
import { setEnvVar } from "../env-file";

const ENV_PATH = join(import.meta.dir, "../../.env");

const CLIENT_SECRET = process.env.ATLASSIAN_CLIENT_SECRET;
if (!CLIENT_SECRET) {
  throw new Error("Set ATLASSIAN_CLIENT_SECRET in .env");
}

// Handles /oauth/callback: exchanges the authorization code for an access token and saves it to .env.
export async function handleRedirection(req: Request): Promise<Response> {
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
  if (!tokenData.access_token) {
    return new Response("Token response has no access_token", { status: 502 });
  }

  await setEnvVar(ENV_PATH, "ATLASSIAN_ACCESS_TOKEN", tokenData.access_token);
  console.log(`Saved ATLASSIAN_ACCESS_TOKEN to ${ENV_PATH}`);
  return new Response("Access token saved to .env. You can close this tab.");
}
