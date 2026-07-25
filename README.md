# Body Map

A single-file personal body-mapping app for tracking skin lesions over time.
Everything (HTML, CSS, JS, body SVG) lives in `index.html`.

## Usage

Open `index.html` in a browser (double-click the file, or drag into a browser
window). On iPhone: AirDrop or upload to Files, then open with Safari.

- Both **front and back figures are visible at once**. Tap either to drop a
  pin — the app infers which side from where you tapped. Region labels use
  patient's left/right.
- **Tap an existing pin** to open its detail view — see the photo timeline,
  add new photos, edit metadata, mark as concerning/resolved.
- **Tap a photo thumbnail** to view it full-size and add notes + size (mm).
- **Backup / Settings** — export a `.json` backup (reimportable) or a `.html`
  viewer (self-contained, shareable with your doctor).

## Data storage

All data lives in the browser's **IndexedDB**, associated with this HTML file's
origin. Photos are stored as `Blob`s. Nothing is sent anywhere.

**Because this runs as a local file (`file://`), storage can be evicted by the
browser without warning** — especially on iOS Safari. **Export a backup regularly**
(the app nags you after 7 days without one). Ideally, migrate to a hosted PWA
(see below) once you're happy with the app.

## Backup format

- `body-map-backup-YYYY-MM-DD.json` — full backup. Photos embedded as base64
  data URLs. Import via Settings → "Import .json backup" (merge or replace).
- `body-map-viewer-YYYY-MM-DD.html` — self-contained read-only viewer. Opens
  in any browser. Good for sharing with a healthcare provider.

## Region labels

When you drop a pin, the app auto-labels the region using a coarse overlay
(~20 rectangles per figure). Labels use *patient's* left/right — i.e., "left
shoulder" is on your body's left, regardless of which figure you're viewing.

The nickname is always editable per pin, so an inaccurate auto-label is
easy to override. If a region label is consistently wrong, edit the region
box in `REGIONS_FRONT` / `REGIONS_BACK` inside `index.html`.

## Install as an app on iPhone (PWA)

Local `file://` storage is fragile — iOS Safari can evict it without warning.
Installing the app to your home screen fixes this: iOS then treats it as an
installed app and gives it **durable storage**, opens it full-screen (no browser
chrome), and works offline. No Mac, Xcode, App Store, or developer account.

The PWA plumbing is already in place: `manifest.json`, `sw.js` (offline service
worker), the icon PNGs, and the `<head>` hooks in `index.html`. You just need to
host the folder over HTTPS and Add to Home Screen.

> **The host never sees your data.** The hosted files are only the empty app
> shell (HTML/CSS/JS/icons). All lesions and photos live solely in your phone's
> IndexedDB. So any static HTTPS host is privacy-safe.

### 1. Host the folder (pick one)

**Easiest — Netlify Drop (no account wiring, instant HTTPS):**
1. On a computer, go to <https://app.netlify.com/drop>.
2. Drag the whole `body-map` folder onto the drop zone.
3. Copy the resulting `https://…netlify.app` URL.

**Stable URL you own — GitHub Pages:**
1. Create a repo, push the `body-map` files.
2. Settings → Pages → Source: your main branch → Save.
3. Use the `https://<you>.github.io/<repo>/` URL.

### 2. Add to Home Screen (must be Safari on iOS)
1. Open the `https://…` URL in **Safari** on the iPhone.
2. Share → **Add to Home Screen** → Add.
3. Launch from the new icon — full-screen, no browser bar.

### 3. Migrate your existing data (important)
Data is scoped per origin, so anything saved in the `file://` version is **not**
visible at the new `https://…` origin. Move it over once:
1. In the *old* `file://` version: Settings → **Export .json backup** (save/AirDrop
   the file to the phone).
2. In the *new* installed app: Settings → **Import .json backup** → choose
   **Replace**.
3. Confirm your pins and photos appear.

Keep exporting `.json` backups periodically anyway (the 7-day nag still applies) —
that file is the real safety net regardless of PWA durability.

### Shipping an update later
Edit the files, then **bump `CACHE` in `sw.js`** (e.g. `bm-v1` → `bm-v2`) and
re-deploy. The old cache is dropped and the app picks up the new version on its
next couple of launches.

## Files

- `index.html` — the app (everything embedded)
- `manifest.json` — web app manifest (name, colors, icons) for installability
- `sw.js` — service worker; caches the shell for offline use
- `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` — manifest icons
- `apple-touch-icon.png` — iOS home-screen icon (180×180)
- `body-map.svg` — original SVG (kept for reference; already inlined in index.html)
- `icons-preview/` — throwaway icon-design comparison sheet; safe to delete
- `README.md` — this file

## Known limitations (v1)

- No pinch-zoom on the body map. If pin placement isn't precise enough,
  this is the first thing to add.
- No side-by-side photo comparison view. All photos are shown in a grid
  timeline; you can open two in separate tabs if needed.
- No image annotation (drawing on photos).
- No "concerning" filter on the main map (all pins visible; color indicates
  status).
- Region labels are approximate rectangles, not shaped to the artwork.
