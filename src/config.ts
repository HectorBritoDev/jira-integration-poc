// Secrets come from .env (gitignored, loaded automatically by Bun).
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

// The Atlassian tools require a cloudId (site UUID, hostname or URL), and no loaded tool can look it up.
export const ATLASSIAN_SITE = "poc-velx.atlassian.net"
export const JIRA_PROJECT_KEY = "KAN"
// Issue type names are localized on this site. "Subtask" is left out because it needs a parent issue.
export const JIRA_ISSUE_TYPES = ["Tarea", "Historia", "Epic"] as const
