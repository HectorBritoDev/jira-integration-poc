# jira-integration-poc

A terminal chat agent that answers questions about a Jira project and can create and edit its issues. It's built with LangChain and talks to any OpenAI-compatible model endpoint (for example a LiteLLM proxy). It uses jira.js for Jira and also loads tools from the Atlassian and LangChain docs MCP servers.

## Requirements

- [Bun](https://bun.sh)
- An Atlassian Cloud site with a Jira project, and an [Atlassian API token](https://id.atlassian.com/manage-profile/security/api-tokens)
- An OpenAI-compatible chat endpoint with a model that supports tool calling

## Setup

```sh
bun install
cp .env.example .env   # then replace the dummy values
```

## Environment variables

Bun loads `.env` automatically. The app stops at startup with `Set <NAME> in .env` if a required variable is missing.

| Variable | Required | Description |
| --- | --- | --- |
| `ATLASSIAN_EMAIL` | Yes | Email of the Atlassian account the agent acts as |
| `ATLASSIAN_API_TOKEN` | Yes | API token for that account |
| `ATLASSIAN_SITE` | Yes | Site hostname, e.g. `your-site.atlassian.net` |
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

The issue types the agent can create are set in `JIRA_ISSUE_TYPES` in `src/config.ts`. Jira localizes these names, so change them to match the names on your site.
