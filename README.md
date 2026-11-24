# jira-integration-poc

A terminal chat agent that answers questions about a Jira project and can create and edit its issues. It's built with LangChain and talks to any OpenAI-compatible model endpoint (for example a LiteLLM proxy). Its Jira tools come from the Atlassian Rovo MCP server (v2), and it also loads tools from the LangChain docs MCP server.

## Requirements

- [Bun](https://bun.sh)
- An Atlassian Cloud site with a Jira project
- API token authentication turned on for the Atlassian MCP server. An organization admin does this in Atlassian Administration, under **Connectors > Atlassian MCP server > Authentication**.
- An Atlassian API token created with scopes (see [Atlassian API token](#atlassian-api-token))
- An OpenAI-compatible chat endpoint with a model that supports tool calling

## Setup

```sh
bun install
cp .env.example .env   # then replace the dummy values
```

## Atlassian API token

The app connects to `https://mcp.atlassian.com/v2/mcp` and sends `Authorization: Basic base64(email:token)`.

The MCP server only accepts an API token created with scopes. A classic token (one without scopes) still connects and lists the tools, but every tool call fails with:

```
Unable to resolve user scopes from the user-context token ... The session token is missing the scope claim required to authorize this operation.
```

Create the token from this link, which preselects the MCP app and all scopes, then put it in `ATLASSIAN_API_TOKEN`:

<https://id.atlassian.com/manage-profile/security/api-tokens?autofillToken&expiryDays=max&appId=mcp-v2&selectedScopes=all>

## Environment variables

Bun loads `.env` automatically. The app stops at startup with `Set <NAME> in .env` if a required variable is missing.

| Variable | Required | Description |
| --- | --- | --- |
| `ATLASSIAN_EMAIL` | Yes | Email of the Atlassian account the agent acts as |
| `ATLASSIAN_API_TOKEN` | Yes | API token with scopes for that account (see [Atlassian API token](#atlassian-api-token)) |
| `ATLASSIAN_SITE` | Yes | Site hostname, e.g. `your-site.atlassian.net`. The model passes it as the `cloudId` argument of the Atlassian tools. |
| `JIRA_PROJECT_KEY` | Yes | Key of the Jira project the agent works in, e.g. `ABC` |
| `LITELLM_BASE_URL` | Yes | Base URL of the OpenAI-compatible endpoint |
| `LITELLM_MODEL` | Yes | Model name to request from that endpoint |
| `LITELLM_API_KEY` | No | API key for the endpoint, if it needs one |

## Run

```sh
bun index.ts
```

The chat sends a first question on its own, then reads your replies from the terminal. Type `exit` or `quit`, or press Ctrl+D, to end it.

## Notes

- Don't add a query string such as `?tools=all` to the MCP URL in `src/mcp.ts`. With it, the server lists only the Rovo `search` tool instead of the full Jira and Confluence tool set.
- The model sees the Atlassian tools as `atlassian_<name>`, e.g. `atlassian_searchJiraIssuesUsingJql`. The system prompt in `src/prompts.ts` tells it to use JQL for finding and counting issues.
- `atlassian_search` is Rovo search, and each call can spend up to 10 Rovo credits. It fails if the organization has no credits left.
- All Atlassian MCP tools are loaded, including the ones that change data, such as `atlassian_createJiraIssue`, `atlassian_editJiraIssue`, `atlassian_executeWrite` and `atlassian_executeDestructive`. To keep the agent read-only, filter the list in `loadMcpTools()` in `src/mcp.ts`.

## jira.js tools (not loaded)

`src/tools/jira` has jira.js versions of the issue tools: `jira_get_issues`, `jira_create_issue` and `jira_edit_issue`. They aren't loaded. To use them:

1. Add `...jiraTools` to the tool list in `index.ts`.
2. Mention them in the system prompt in `src/prompts.ts`.
3. Give them a classic API token. They call the Jira REST API at `https://<ATLASSIAN_SITE>`, which rejects the scoped MCP token with 401. Both currently read `ATLASSIAN_API_TOKEN`, so running them alongside the MCP tools needs a second variable.

The issue types `jira_create_issue` can create are set in `JIRA_ISSUE_TYPES` in `src/config.ts`. Jira localizes these names, so change them to match the names on your site.
