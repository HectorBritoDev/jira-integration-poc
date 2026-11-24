// Jira Cloud stores rich text (descriptions, comments) as Atlassian Document Format (ADF), a JSON tree.
// The model reads and writes plain text, so these helpers convert between the two.

type AdfNode = { type: string; text?: string; content?: AdfNode[] }

const BLOCK_NODES = new Set(["paragraph", "heading", "listItem", "codeBlock", "blockquote"])

/** Plain text -> ADF document, one paragraph per non-empty line. */
export function textToAdf(text: string) {
  return {
    type: "doc",
    version: 1,
    content: text
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => ({ type: "paragraph", content: [{ type: "text", text: line }] })),
  }
}

/** ADF document (or a plain string, or nothing) -> plain text, one line per block. */
export function adfToText(node: unknown): string {
  if (!node) return ""
  if (typeof node === "string") return node

  const { type, text, content } = node as AdfNode
  if (type === "text") return text ?? ""
  if (type === "hardBreak") return "\n"

  const inner = (content ?? []).map(adfToText).join("")
  return BLOCK_NODES.has(type) ? `${inner}\n` : inner
}
