import { tool } from "@langchain/core/tools"
import z from "zod"
import { JIRA_ISSUE_TYPES, JIRA_PROJECT_KEY } from "../../config"
import { textToAdf } from "../../jira/adf"
import { issueUrl, jira } from "../../jira/client"

export const createIssue = tool(
  async ({ summary, description, issueType }) => {
    const created = await jira.issues.createIssue({
      fields: {
        // The project is fixed so the model can't create issues anywhere else.
        project: { key: JIRA_PROJECT_KEY },
        issuetype: { name: issueType },
        summary,
        ...(description ? { description: textToAdf(description) } : {}),
      },
    })

    return JSON.stringify({ key: created.key, url: issueUrl(created.key) })
  },
  {
    name: "jira_create_issue",
    description: `Creates a Jira issue in project ${JIRA_PROJECT_KEY} and returns its key and URL.`,
    schema: z.object({
      summary: z.string().min(1).describe("One-line title of the issue"),
      description: z.string().optional().describe("Plain-text description; each line becomes a paragraph"),
      issueType: z.enum(JIRA_ISSUE_TYPES).default("Tarea").describe("Tarea = task, Historia = story, Epic = epic"),
    }),
  }
)
