import { createCloudClient } from "jira.js"
import { ATLASSIAN_ACCESS_TOKEN, ATLASSIAN_SITE } from "../config"

// With OAuth 2.0, jira.js looks up the site's cloud ID and calls https://api.atlassian.com/ex/jira/<cloudId>.
export const jira = createCloudClient({
  auth: { type: "oauth2", accessToken: ATLASSIAN_ACCESS_TOKEN, siteUrl: `https://${ATLASSIAN_SITE}` },
})

export const issueUrl = (key: string) => `https://${ATLASSIAN_SITE}/browse/${key}`
