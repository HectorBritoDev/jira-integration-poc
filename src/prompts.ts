import { ATLASSIAN_SITE, JIRA_PROJECT_KEY } from "./config"

export const SYSTEM_PROMPT =
  `Our Atlassian site is ${ATLASSIAN_SITE}. Our Jira project key is ${JIRA_PROJECT_KEY}; only consider issues from that project. ` +
  "Use the jira_get_issues, jira_create_issue and jira_edit_issue tools to find, create and edit Jira issues. " +
  `Only use atlassian_search for content those tools can't reach, and always pass "${ATLASSIAN_SITE}" as its "cloudId" argument.`
