const AUTHORIZE_URL = "https://auth.atlassian.com/authorize";
const AUDIENCE = "api.atlassian.com";
export const CLIENT_ID = "lOm6hMSxPyEoXyjWZqPtT1ov7wkdp03J";
export const REDIRECT_URI = "http://localhost:1234/oauth/callback";
export const STATE = "12345";
const SCOPES = [
  "read:jira-work",
  "read:jira-user",
  "write:jira-work",
  "manage:jira-project",
];

const params = {
  audience: AUDIENCE,
  client_id: CLIENT_ID,
  scope: SCOPES.join(" "),
  redirect_uri: REDIRECT_URI,
  state: STATE,
  response_type: "code",
  prompt: "consent",
};

const query = Object.entries(params)
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join("&");

export const urlToAuth = `${AUTHORIZE_URL}?${query}`;

