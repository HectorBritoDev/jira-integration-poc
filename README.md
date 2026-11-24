# jira-integration-poc

A terminal chat agent that answers questions about a Jira project and can create and edit its issues. It's built with LangChain and talks to any OpenAI-compatible model endpoint (for example a LiteLLM proxy). Its Jira tools come from the Atlassian Rovo MCP server (v2), and it also loads tools from the LangChain docs MCP server.

## Requirements

- [Bun](https://bun.sh)
- An Atlassian Cloud site with a Jira project
- An OAuth 2.0 (3LO) app on [developer.atlassian.com](https://developer.atlassian.com/console/myapps/) with the Jira scopes listed in `redirect.ts` and the callback URL `http://localhost:1234/oauth/callback`
- An OpenAI-compatible chat endpoint with a model that supports tool calling

## Setup

```sh
bun install
cp .env.example .env   # then replace the dummy values
```

## Atlassian access token

Both the MCP client and jira.js send `Authorization: Bearer <ATLASSIAN_ACCESS_TOKEN>`. Get the token with the OAuth flow:

```sh
bun server.ts
```

Open the URL it prints, approve access, and the callback writes the token to `ATLASSIAN_ACCESS_TOKEN` in `.env`. Then stop the server.

The token expires after about an hour, and the flow doesn't ask for a refresh token (no `offline_access` scope), so run it again when the token expires.

## Environment variables

Bun loads `.env` automatically. The app stops at startup with `Set <NAME> in .env` if a required variable is missing.

| Variable | Required | Description |
| --- | --- | --- |
| `ATLASSIAN_CLIENT_ID` | Yes | Client ID of the OAuth 2.0 app, used by `server.ts` |
| `ATLASSIAN_CLIENT_SECRET` | Yes | Secret of the OAuth 2.0 app, used by `server.ts` |
| `ATLASSIAN_ACCESS_TOKEN` | Yes | OAuth 2.0 access token. `server.ts` writes it (see [Atlassian access token](#atlassian-access-token)) |
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

## jira.js tools

`src/tools/jira` has jira.js versions of the issue tools: `jira_get_issues`, `jira_create_issue` and `jira_edit_issue`. `index.ts` loads them next to the MCP tools, but the system prompt in `src/prompts.ts` doesn't mention them yet.

They use the same access token as the MCP client. With an OAuth token, jira.js looks up the site's cloud ID from `https://api.atlassian.com/oauth/token/accessible-resources` (matching `ATLASSIAN_SITE`) and calls the Jira REST API at `https://api.atlassian.com/ex/jira/<cloudId>`, not at `https://<ATLASSIAN_SITE>`.

The issue types `jira_create_issue` can create are set in `JIRA_ISSUE_TYPES` in `src/config.ts`. Jira localizes these names, so change them to match the names on your site.
