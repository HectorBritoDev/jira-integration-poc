import { createCloudClient } from "jira.js"
import { ATLASSIAN_API_TOKEN, ATLASSIAN_EMAIL, ATLASSIAN_SITE } from "../config"

export const jira = createCloudClient({
  host: `https://${ATLASSIAN_SITE}`,
  auth: { type: "basic", email: ATLASSIAN_EMAIL, apiToken: ATLASSIAN_API_TOKEN },
})

export const issueUrl = (key: string) => `https://${ATLASSIAN_SITE}/browse/${key}`
