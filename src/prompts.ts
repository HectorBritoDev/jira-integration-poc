import { ATLASSIAN_SITE, JIRA_PROJECT_KEY } from "./config"

export const SYSTEM_PROMPT =
  `Our Atlassian site is ${ATLASSIAN_SITE}. Our Jira project key is ${JIRA_PROJECT_KEY}; only consider issues from that project. ` +
  `Always pass "${ATLASSIAN_SITE}" as the "cloudId" argument of atlassian_* tools. ` +
  "Use atlassian_searchJiraIssuesUsingJql to find and count Jira issues, and atlassian_createJiraIssue and atlassian_editJiraIssue to create and edit them. " +
  "Only use atlassian_search (Rovo search, which spends Rovo credits) for content JQL can't reach."
