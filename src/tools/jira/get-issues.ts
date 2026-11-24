import { tool } from "@langchain/core/tools"
import z from "zod"
import { JIRA_PROJECT_KEY } from "../../config"
import { adfToText } from "../../jira/adf"
import { jira } from "../../jira/client"

// Keeps tool output (and the model's context) small when issues have long descriptions.
const MAX_DESCRIPTION_LENGTH = 500

export const getIssues = tool(
  async ({ jql, maxResults }) => {
    const result = await jira.issueSearch.searchIssues({
      jql,
      maxResults,
      fields: ["summary", "status", "issuetype", "assignee", "priority", "labels", "created", "updated", "description"],
    })

    const issues = (result.issues ?? []).map(({ key, fields }) => ({
      key,
      summary: fields?.summary,
      status: fields?.status?.name,
      statusCategory: fields?.status?.statusCategory?.key,
      type: fields?.issuetype?.name,
      assignee: fields?.assignee?.displayName ?? null,
      priority: fields?.priority?.name ?? null,
      labels: fields?.labels ?? [],
      created: fields?.created,
      updated: fields?.updated,
      description: adfToText(fields?.description).trim().slice(0, MAX_DESCRIPTION_LENGTH),
    }))

    return JSON.stringify({ returned: issues.length, hasMore: !result.isLast, issues })
  },
  {
    name: "jira_get_issues",
    description:
      "Searches Jira issues with JQL and returns each issue's key, summary, status, type, assignee, priority, labels, dates and description. " +
      `Always scope the query to the project, e.g. "project = ${JIRA_PROJECT_KEY} AND ...". Use currentUser() for the person asking. ` +
      "Status names on this site are in Spanish, so filter with statusCategory instead of status: " +
      "statusCategory = new (to do), indeterminate (in progress) or done.",
    schema: z.object({
      jql: z.string().min(1).describe(
        `JQL query, e.g. "project = ${JIRA_PROJECT_KEY} AND assignee = currentUser() AND statusCategory = new ORDER BY created DESC"`
      ),
      maxResults: z.number().int().min(1).max(100).default(50).describe("Maximum number of issues to return"),
    }),
  }
)
