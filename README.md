# jira-integration-poc

A terminal chat agent that reads, creates and edits issues in a Jira project. It uses LangChain with an OpenAI-compatible model endpoint (for example a LiteLLM proxy), and signs in to Atlassian with an OAuth 2.0 access token.

## Before you start

You need:

- [Bun](https://bun.sh)
- An OAuth 2.0 (3LO) app in the [Atlassian developer console](https://developer.atlassian.com/console/myapps/) with:
  - the callback URL `http://localhost:1234/oauth/callback`
  - the Jira API scopes `read:jira-work`, `read:jira-user`, `write:jira-work` and `manage:jira-project`
- An OpenAI-compatible chat endpoint with a model that supports tool calling

## Steps

Run these in order, from the project folder.

### 1. Install dependencies

```sh
bun install
```

### 2. Create `.env`

```sh
cp .env.example .env
```

Then fill in:

| Variable | Value |
| --- | --- |
| `ATLASSIAN_CLIENT_ID` | Client ID of your OAuth app |
| `ATLASSIAN_CLIENT_SECRET` | Secret of your OAuth app |
| `ATLASSIAN_SITE` | Your site's hostname, e.g. `your-site.atlassian.net` |
| `JIRA_PROJECT_KEY` | Key of the Jira project, e.g. `ABC` |
| `LITELLM_BASE_URL` | Base URL of the model endpoint |
| `LITELLM_MODEL` | Model name |
| `LITELLM_API_KEY` | API key for the endpoint. Leave it empty if the endpoint doesn't need one. |

Leave `ATLASSIAN_ACCESS_TOKEN` empty. Step 3 fills it in.

### 3. Get an access token

```sh
bun server.ts
```

Open the URL it prints and approve access. When the page says "Access token saved to .env", stop the server with Ctrl+C.

### 4. Start the chat

```sh
bun index.ts
```

The chat sends the question in `firstMessage` in `index.ts`, then reads your replies. Type `exit` or `quit`, or press Ctrl+D, to end it.

## When the token expires

The access token lasts about an hour, and there's no refresh token. When it expires, repeat step 3 and then step 4.

## Notes

- The Atlassian MCP tools (`atlassian_*`) fail with `Insufficient scope: required "search:jira:agent-interface"` because the OAuth app doesn't request that scope. The jira.js tools (`jira_get_issues`, `jira_create_issue` and `jira_edit_issue`) work.
- Jira translates issue type names into the site's language. Set the names `jira_create_issue` can use in `JIRA_ISSUE_TYPES` in `src/config.ts`.
