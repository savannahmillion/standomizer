/// <reference types="vite/client" />
import { parseFrontMatter } from "./frontmatter";
import { isStampEmoji } from "./stamps";

// Daily themes live in /themes/*.md — one file per theme, bundled at build
// time. See themes/README.md for the format.

export type ThemeImage = {
  url: string; // https://… or a path under /public, e.g. /themes/park.svg
  alt: string;
  credit?: string;
  creditUrl?: string;
};

export type Theme = {
  id: string; // the file name, e.g. "park"
  question: string;
  image: ThemeImage;
  emojis?: string[]; // the emoji wheel for this theme; default wheel if absent
  contributor?: string; // shown as "theme contributed by …"
};

// The wheel fits up to 11 emoji around the "+".
export const MAX_THEME_EMOJIS = 11;

const files = import.meta.glob<string>("/themes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Returns the theme, or an error string if the file can't be used. Problems
// that don't make the theme unusable (e.g. one bad emoji) go to `warn`.
export function parseTheme(
  path: string,
  source: string,
  warn: (message: string) => void = (m) => console.warn(`[themes] ${m}`),
): Theme | string {
  const id = path.split("/").pop()!.replace(/\.md$/, "");
  const { data } = parseFrontMatter(source);
  const missing = ["question", "image", "alt"].filter((k) => !data[k]);
  if (missing.length) return `${path}: missing ${missing.join(", ")} in front matter`;
  if (!/^(https:\/\/|\/)/.test(data.image)) return `${path}: image must be an https:// URL or a /path in public/`;

  const theme: Theme = {
    id,
    question: data.question,
    image: {
      url: data.image,
      alt: data.alt,
      credit: data.credit || undefined,
      creditUrl: data.creditUrl || undefined,
    },
  };
  if (data.contributor) theme.contributor = data.contributor;
  if (data.emojis) {
    const emojis = parseEmojis(data.emojis, (m) => warn(`${path}: ${m}`));
    if (emojis.length) theme.emojis = emojis;
    else warn(`${path}: no usable emojis; using the default wheel`);
  }
  return theme;
}

// "🌳 🦆, 🧺" -> ["🌳", "🦆", "🧺"]. Splits by character (so skin tones, flags,
// and combined emoji stay whole); spaces and commas between them are optional.
function parseEmojis(value: string, warn: (message: string) => void): string[] {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const out: string[] = [];
  const rejected: string[] = [];
  for (const { segment } of segmenter.segment(value)) {
    if (/^[\s,]+$/.test(segment)) continue;
    if (!isStampEmoji(segment)) rejected.push(segment);
    else if (!out.includes(segment)) out.push(segment);
  }
  if (rejected.length) warn(`ignoring non-emoji in emojis: ${rejected.join(" ")}`);
  if (out.length > MAX_THEME_EMOJIS) {
    warn(`emojis has ${out.length}; the wheel fits ${MAX_THEME_EMOJIS}, so the rest are dropped`);
    out.length = MAX_THEME_EMOJIS;
  }
  return out;
}

function loadThemes(): Theme[] {
  const themes: Theme[] = [];
  for (const [path, source] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    if (path.endsWith("/README.md")) continue;
    const result = parseTheme(path, source);
    if (typeof result === "string") console.error(`[themes] Skipping ${result}`);
    else themes.push(result);
  }
  if (themes.length === 0) throw new Error("[themes] No valid themes found in /themes/*.md");
  return themes;
}

export const THEMES: Theme[] = loadThemes();
