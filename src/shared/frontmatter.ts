// A tiny front-matter parser for theme files. Supports:
//   key: value              (values may be wrapped in single or double quotes)
//   key:                    followed by "- item" lines, joined with spaces
//     - item
//   # comment lines, and trailing " # comments" on unquoted values
// That's all theme files need, and it keeps a YAML library out of the Worker.

export type FrontMatter = { data: Record<string, string>; body: string };

export function parseFrontMatter(source: string): FrontMatter {
  const text = source.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: text };

  const data: Record<string, string> = {};
  let listKey: string | null = null; // the last "key:" with no value, collecting "- item" lines

  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue; // comment line

    // "- item" under a "key:" line
    if (listKey && /^-\s+/.test(trimmed)) {
      const item = clean(trimmed.replace(/^-\s+/, ""));
      if (item) data[listKey] = data[listKey] ? `${data[listKey]} ${item}` : item;
      continue;
    }

    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    const value = clean(trimmed.slice(colon + 1));
    if (!key) continue;
    data[key] = value;
    listKey = value ? null : key;
  }
  return { data, body: match[2].trim() };
}

function clean(raw: string): string {
  let value = raw.trim();
  const quoted = value.startsWith('"') || value.startsWith("'");
  // Trailing comment: whitespace, "#", then whitespace or end of line. Requiring
  // the space after "#" keeps URL #fragments and the keycap emoji #️⃣ intact.
  if (!quoted) value = value.replace(/\s+#(\s.*)?$/, "");
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
  ) {
    value = value.slice(1, -1);
  }
  return value;
}
