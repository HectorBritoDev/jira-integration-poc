// Secrets and site settings come from .env (gitignored, loaded automatically by Bun).
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Set ${name} in .env`)
  }
  return value
}

export const ATLASSIAN_EMAIL = requireEnv("ATLASSIAN_EMAIL")
export const ATLASSIAN_API_TOKEN = requireEnv("ATLASSIAN_API_TOKEN")
export const LITELLM_API_KEY = process.env.LITELLM_API_KEY
export const LITELLM_BASE_URL = requireEnv("LITELLM_BASE_URL")
export const LITELLM_MODEL = requireEnv("LITELLM_MODEL")

// The Atlassian tools require a cloudId (site UUID, hostname or URL), and no loaded tool can look it up.
export const ATLASSIAN_SITE = requireEnv("ATLASSIAN_SITE")
export const JIRA_PROJECT_KEY = requireEnv("JIRA_PROJECT_KEY")
// Issue type names are localized on this site. "Subtask" is left out because it needs a parent issue.
export const JIRA_ISSUE_TYPES = ["Tarea", "Historia", "Epic"] as const
