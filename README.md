# Quattro for Logseq DB

A standalone adaptation of [RoamStudio's Quattro theme](https://github.com/rcvd/RoamStudio) for [Logseq DB](https://github.com/logseq/logseq): iA Writer Quattro S typography, neutral gray surfaces, quiet links, and light/dark palettes.

## Install in Logseq DB

Open your DB graph's **Settings → General → Custom theme → Edit custom.css** (labels may vary by Logseq version) and add this as the first line, before any ordinary CSS rules:

```css
@import url("https://cdn.jsdelivr.net/gh/julve/logseq-quattro@main/custom.css");
```

Save and reload Logseq. Switch between Light and Dark in Logseq's appearance controls; the theme follows `html[data-theme]`. Preserve any existing CSS you want to keep and place your overrides after the import.

The import requires `custom.css` to be published to this repository's public `main` branch and access to `cdn.jsdelivr.net`. The `@main` URL follows published updates, subject to CDN caching. For a fixed version, replace `main` in the URL with a published commit SHA. GitHub's raw endpoint can serve CSS as `text/plain`; jsDelivr serves a stylesheet content type.

For offline use, copy the full contents of [`custom.css`](custom.css) into the editor instead of importing it.

Use the DB graph's built-in CSS editor: DB graphs do not require a filesystem graph folder. The file embeds all four original font faces; no separate font installation, JavaScript plugin, or build step is required to use it. Disable other custom themes when comparing the appearance.

## Coverage

- Light `#f5f5f5` and dark `#171717` writing surfaces; contrasting sidebars.
- Original iA Writer Quattro S regular, italic, bold, and bold italic.
- Current DB `--lx-gray-*` / `--lx-accent-*` Radix tokens, alpha scales, HSL UI tokens, and legacy `--ls-*` aliases.
- Page titles, headings, references, tags, blockquotes, inline code, properties, tables, checkboxes, and editor typography.
- System UI typography for navigation and property controls; native layout, icon fonts, and syntax colors stay under Logseq's control.
- Visible keyboard focus and restrained link underlines.

To customize, append CSS after the theme, for example:

```css
html[data-theme], html[data-theme] body {
  --quattro-content-width: 860px;
  --ls-page-text-size: 17px;
  --ls-page-text-line-height: 1.8;
}
```

## Development

Requires Node.js 22+ and Chromium. Browser tests use `/usr/bin/chromium`; set `CHROMIUM_PATH` to use a different executable.

```sh
npm ci --cache /tmp/npm-cache
npm run build
npm test
npm run dev
```

`npm run dev` serves a component fixture on loopback port 4173. Stop with Ctrl+C. It is a local development tool, not a Logseq instance. Edit `src/theme.css` and rebuild; `custom.css` is the committed, self-contained distribution. `src/fonts.css` contains the unmodified, base64-encoded upstream WOFF2 fonts.

The preview loads the theme through a local `@import`. The five browser/distribution checks cover both palettes, all font faces, foreground and secondary text contrast, modeled upstream token precedence, editing, checkbox interaction, reference navigation, absence of external asset requests, mobile overflow, and reproducible output. Screenshots are generated in ignored `test-results/`.

### Validation limits

Source compatibility was checked against Logseq DB commit `d06ded997133d3abfedfdf2fe8a8854b0e9d139d`. Browser tests run against representative component markup, not the full ClojureScript/Electron app. Actual DB integration, popovers, complex property editors, whiteboards, PDFs, and platform-specific mobile behavior still need review in Logseq. This repository does not build or bundle Logseq itself. Logseq's UI evolves; this is an initial implementation, not a marketplace release or a claim of full end-to-end compatibility.

## Credits and licenses

- Quattro design/palette inspiration: Alexander Rink's [RoamStudio](https://github.com/rcvd/RoamStudio), commit `5b23816b60e608dbb3d6da203e66a8dddd441946`. MIT notice retained in `licenses/RoamStudio-MIT.txt`.
- [iA Writer Quattro](https://github.com/iaolo/iA-Fonts), by iA, based on IBM Plex, commit `c6588670c71e9ac628acc27b72cde4bf12726b7f`. Original static WOFF2 files are embedded unchanged; SIL OFL 1.1 notice is in `licenses/iA-Writer-Quattro-OFL.md`.
- Theme adaptation and development tools: MIT, see `LICENSE`. Font licensing remains separate.

This project is an independent adaptation and is not affiliated with Logseq, Roam Research, RoamStudio, or iA.
