# Themes

Each `.md` file in this folder is one daily theme: a question and one image. The server picks one theme per day (see `src/shared/daily.ts`), and everyone in a room stamps an emoji on the image.

```md
---
question: What are you doing at the park?
image: /themes/park.svg
alt: Illustrated bird's-eye view of a park with a playground, pond, and picnic area
credit: Artist Name            # optional
creditUrl: https://example.com # optional
contributor: Your Name         # optional
emojis: 🛝 🧺 ⚽ 🦆 🍦 🌸 🐕 😎 🌳  # optional
---

Anything below the front matter is notes for whoever edits the theme; it isn't shown.
```

- **id** is the file name (`park.md` → `park`).
- **question** (required) is shown above the image.
- **image** (required) is either an `https://` URL or a path to a file in `public/`, e.g. put `public/themes/park.svg` and write `/themes/park.svg`.
- **alt** (required) describes the image for screen readers.
- **credit** / **creditUrl** (optional) are shown on the image when set.
- **contributor** (optional) is who made the theme. When set, the room shows "theme contributed by Your Name" at the bottom of the page.
- **emojis** (optional) replaces the quick-pick emoji on the emoji wheel for this theme. Leave it out to use the default wheel (😀 😂 😍 😬 😴 🫠 🤯 🔥 🎉).

## Custom emoji wheel

Pick emoji that match the picture, so people can answer with them: 🛝 for the playground, 🦆 for the pond, and so on. The **+** at the bottom of the wheel still opens every emoji.

Write them on one line, with or without spaces or commas:

```md
emojis: 🛝 🧺 ⚽ 🦆 🍦 🌸 🐕 😎 🌳
```

or as a list:

```md
emojis:
  - 🛝
  - 🧺
  - ⚽
```

- **Up to 11.** That's what fits around the wheel; any extras are dropped. Any number from 1 up works, and "+" always stays at the bottom center.
- **Order:** the first emoji goes at the top, then clockwise around to "+" at the bottom, then on up the left side.
- **Any emoji works,** including skin tones, flags, and combined ones like 👩🏽‍💻. Anything that isn't an emoji is ignored, with a warning in the server log.
- Everyone still starts with 😀 as their stamp until they pick something.

## Image size and shape

Full guidance, including how to check and shrink a picture, is in the main README under [Picture size and dimensions](../README.md#picture-size-and-dimensions).


The placeholder maps are **800 × 500** SVGs (8:5), but any size or shape works: the board reads the image's proportions when it loads and sizes itself to match, and stamps are saved as percentages of the image, so they land in the same spot on every screen.

- **Landscape works best.** On a laptop or desktop the image is shown at most about 670 px wide (about 310 px on a phone). Images fill that width, capped at 70% of the window height, so wide shapes (8:5, 3:2, 16:10) show biggest. Square or tall images still work but get smaller to fit the height cap.
- **Make them crisp.** PNG/JPG: about **1600 × 1000** (2× for high-res screens) is plenty; try to keep files under ~500 KB, since everyone loads the image each day. SVG: any size, as long as it has a `viewBox` (most design tools add one).
- **Leave a little breathing room at the edges.** Stamps are centered where people click, so ones near the border get partly cut off. The bottom-right corner is where the photographer credit appears, if the theme has one.

## Tips


- Images with lots of distinct, recognizable spots work best (a park from above, a floor plan, a map), since people stamp where they "are".
- Prefer files in `public/` over remote URLs: they can't disappear or be hotlink-blocked. If you use a URL, make sure the site allows hotlinking and the license allows reuse (Unsplash and Pexels do; credit the photographer).
- Keep it work-appropriate.
- A file with missing fields is skipped, with an error in the server log.
