// Sets NAME=value in a .env file: replaces the existing NAME line, or appends one.
export async function setEnvVar(path: string, name: string, value: string) {
  const file = Bun.file(path)
  const content = (await file.exists()) ? await file.text() : ""
  const line = `${name}=${value}`
  const pattern = new RegExp(`^${name}=.*$`, "m")

  const updated = pattern.test(content)
    ? content.replace(pattern, () => line)
    : `${content}${content === "" || content.endsWith("\n") ? "" : "\n"}${line}\n`

  await Bun.write(path, updated)
}
