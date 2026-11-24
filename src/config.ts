// Secrets and site settings come from .env (gitignored, loaded automatically by Bun).
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Set ${name} in .env`)
  }
  return value
}

// OAuth 2.0 (3LO) access token, written to .env by server.ts. It expires after about an hour.
export const ATLASSIAN_ACCESS_TOKEN = requireEnv("ATLASSIAN_ACCESS_TOKEN")
export const LITELLM_API_KEY = process.env.LITELLM_API_KEY
export const LITELLM_BASE_URL = requireEnv("LITELLM_BASE_URL")
export const LITELLM_MODEL = requireEnv("LITELLM_MODEL")

// jira.js uses the site to pick the cloud ID the token can reach, and to build issue links.
export const ATLASSIAN_SITE = requireEnv("ATLASSIAN_SITE")
export const JIRA_PROJECT_KEY = requireEnv("JIRA_PROJECT_KEY")
// Issue type names are localized on this site. "Subtask" is left out because it needs a parent issue.
export const JIRA_ISSUE_TYPES = ["Tarea", "Historia", "Epic"] as const
