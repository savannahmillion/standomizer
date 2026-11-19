import { TEAM_TIMEZONE } from "./team";
import { THEMES, type Theme, type ThemeImage } from "./themes";


export type Board = {
  date: string; // YYYY-MM-DD in TEAM_TIMEZONE
  themeId: string;
  question: string;
  image: ThemeImage;
  emojis?: string[]; // this theme's emoji wheel, if it sets one
  contributor?: string;
};

export function dateKey(now: Date, timeZone = TEAM_TIMEZONE): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// The same date always produces the same board, so nothing needs storing.
export function boardFor(date: string, themes: Theme[] = THEMES): Board {
  return boardForTheme(date, themeFor(date, themes));
}

// Demo only: the theme after `themeId` in the list, wrapping around.
export function nextThemeAfter(themeId: string, themes: Theme[] = THEMES): Theme {
  const i = themes.findIndex((t) => t.id === themeId);
  return themes[(i + 1) % themes.length];
}

export function boardForTheme(date: string, theme: Theme): Board {
  return {
    date,
    themeId: theme.id,
    question: theme.question,
    image: theme.image,
    ...(theme.emojis && { emojis: theme.emojis }),
    ...(theme.contributor && { contributor: theme.contributor }),
  };
}

// Go through every theme in a shuffled order before any repeats, and never
// show the same theme two days in a row across a cycle boundary.
function themeFor(date: string, themes: Theme[]): Theme {
  const n = themes.length;
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  if (n <= 2) return themes[day % n];

  const cycle = Math.floor(day / n);
  const order = seededShuffle(themes, hash(`cycle:${cycle}`));
  const previousLast = seededShuffle(themes, hash(`cycle:${cycle - 1}`))[n - 1];
  if (order[0] === previousLast) [order[0], order[1]] = [order[1], order[0]];
  return order[day % n];
}

// FNV-1a
function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32
function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  const random = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
