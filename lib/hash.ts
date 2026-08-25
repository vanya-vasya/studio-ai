import { createHash } from "crypto";

/** Stable hash of tool + params + file bytes → powers the free-cache rule. */
export const hashRunInputs = (
  toolSlug: string,
  params: Record<string, string>,
  files: { id: string; bytes: Buffer }[],
): string => {
  const hash = createHash("sha256");
  hash.update(toolSlug);
  for (const key of Object.keys(params).sort()) {
    hash.update(`|${key}=${params[key]}`);
  }
  for (const file of [...files].sort((a, b) => a.id.localeCompare(b.id))) {
    hash.update(`|${file.id}:`);
    hash.update(file.bytes);
  }
  return hash.digest("hex");
};
