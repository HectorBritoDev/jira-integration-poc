import { tool } from "@langchain/core/tools"
import z from "zod"
import { JIRA_PROJECT_KEY } from "../../config"
import { textToAdf } from "../../jira/adf"
import { issueUrl, jira } from "../../jira/client"

export const editIssue = tool(
  async ({ issueKey, summary, description }) => {
    const key = issueKey.trim().toUpperCase()
    // Errors thrown here are sent back to the model by runAgent, so it can correct itself.
    if (!key.startsWith(`${JIRA_PROJECT_KEY}-`)) {
      throw new Error(`Only issues in project ${JIRA_PROJECT_KEY} can be edited, got "${issueKey}"`)
    }
    if (summary === undefined && description === undefined) {
      throw new Error("Nothing to change: pass summary and/or description")
    }

    await jira.issues.editIssue({
      issueIdOrKey: key,
      fields: {
        ...(summary !== undefined ? { summary } : {}),
        ...(description !== undefined ? { description: textToAdf(description) } : {}),
      },
    })

    const updated = [summary !== undefined && "summary", description !== undefined && "description"].filter(Boolean)
    return JSON.stringify({ key, updated, url: issueUrl(key) })
  },
  {
    name: "jira_edit_issue",
    description:
      `Edits the summary and/or description of an existing Jira issue in project ${JIRA_PROJECT_KEY}. ` +
      "Only the fields you pass are changed. It can't change status or assignee.",
    schema: z.object({
      issueKey: z.string().describe(`Issue key, e.g. "${JIRA_PROJECT_KEY}-1"`),
      summary: z.string().min(1).optional().describe("New one-line title"),
      description: z.string().optional().describe("New plain-text description; replaces the current one entirely"),
    }),
  }
)
