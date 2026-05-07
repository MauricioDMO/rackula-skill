export function extractMetadata(yaml: string, fileName = "input"): { id: string | null; name: string } {
  const id = yaml.match(/^metadata:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+id:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();
  const name = yaml.match(/^metadata:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+name:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();

  if (!name) {
    throw new Error(`${fileName} must include metadata.name`);
  }

  return { id: id ?? null, name: name?.trim() ?? "schema" };
}

export function sanitizeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim();
}