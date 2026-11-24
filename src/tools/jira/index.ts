import { createIssue } from "./create-issue"
import { editIssue } from "./edit-issue"
import { getIssues } from "./get-issues"

export const jiraTools = [getIssues, createIssue, editIssue]
