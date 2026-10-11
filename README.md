# Figen & Elizabeth — Engagement Invitation

A static, mobile-first invitation site (React + Vite), published with GitHub Pages.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build
```

## Single offline file (for a phone)

```bash
npm run build:single   # → dist-single/index.html (~820 KB, everything inlined)
```

Send that one file to a phone and open it in Chrome or Safari. The song is embedded, so it's about 8 MB.

## Change the content

Everything guests read is in **`src/config.js`**: names, monogram letters, date,
family details, venues, times, Google Maps links, closing names and the music path.
Edit it, then push; nothing else needs to change.

- **Date**: `date: '2026-11-07'`. The weekday and written-out date are derived from it.
- **Times**: written exactly as displayed (`'11.00 a.m.'`, as on the card).
- **Maps**: paste any Google Maps share link into `mapsUrl`.

The link-preview title and description (what WhatsApp shows) are in `index.html`.

## Music

The song lives in `src/assets/audio/` (currently `golden-hour-instrumental.mp3`).
The first `.mp3` there is used; with none, the site builds normally and the music
button doesn't appear. The single phone file embeds the song; web builds ship it
as a separate file.

The song is committed and published with the site (the client's decision). It's a
copyrighted recording, so anyone can download it from the public repository.

Playback starts when the guest taps the seal, fades in, keeps playing while they
scroll, pauses when they switch apps and resumes when they return.

## How the page works

It's built for phones in portrait; on a computer it shows the same phone-width column.

After the wax-seal cover, the invitation is a series of full-screen **frames**
(`src/components/Scenes.jsx`): names → date → families → couple → ceremony →
reception → closing. The page itself doesn't scroll: a swipe up/down (or mouse
wheel, arrow keys, or the dots on the right) plays a fixed-length transition
(mist, paper, light or dusk) to the next frame. This lives in `src/useFrames.js`.
With reduced motion turned on, frames simply cross-fade.

## Images

Scene backdrops and the couple photo live in `src/assets/scenes/` and are wired
up at the top of `src/config.js`. **Files named `placeholder-*` are stand-ins.**

To use final artwork: save it into `src/assets/scenes/` (portrait 9:16, around
1080×1920, JPG or WebP) and change the matching `import` line in `src/config.js`.
`mist.webp` is the transition mist and isn't a placeholder. `npm run placeholders`
regenerates the stand-ins.

- `reference/original-card.jpg` is the printed card.
- `public/images/og-preview.jpg` (1200×630) is the WhatsApp link preview (`npm run logo`).

The FE logo comes from `reference/logo-original.jpg`; `npm run logo` lifts it off its paper
into `src/assets/logo/` (colour logo, a silhouette used for the wax-seal impression, the
favicon) and rebuilds the WhatsApp preview. The wax seal, envelope, sprig and paper grain
are drawn in code. The seal colour is at
the top of `src/components/WaxSeal.jsx`.

## Publish on GitHub Pages

One-time setup:

1. Create a GitHub repository, e.g. `engagement`. With a free GitHub account it must be **public**
   for Pages to work. Private repos need a paid plan.
2. Push this folder to the `main` branch:
   ```bash
   git init -b main
   git add .
   git commit -m "Engagement invitation"
   git remote add origin https://github.com/<username>/engagement.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` builds and publishes the site. Watch it under the
   **Actions** tab. The site will be at `https://<username>.github.io/engagement/`.

Updating: edit, commit, push. The site redeploys in about a minute at the **same link**, so WhatsApp
messages you've already sent keep working.

**Custom domain (optional):** set it under Settings → Pages. The workflow picks the new address up
automatically for the preview tags.

## WhatsApp preview

After the first deploy, paste the URL into https://www.opengraph.xyz/ (or Facebook's Sharing Debugger)
to check the preview image and text. WhatsApp caches previews, so after changing them, test with
`…/engagement/?v=2` to see the new version.

## Structure

```
src/
  config.js                 ← all editable content
  App.jsx                   page order
  styles.css                palette, type, layout, animation
  useBackgroundMusic.js     single persistent <audio>
  useReveal.js              scroll reveals + landscape parallax
  components/
    InvitationCover.jsx     envelope + opening sequence (GSAP)
    WaxSeal.jsx             SVG seal that cracks in two
    BotanicalLeafButton.jsx the sprig "Open Invitation" control
    Sprig.jsx               recurring gold sprig motif
    Monogram.jsx            F & D monogram
    InvitationHero, DateReveal, FamilyDetails, EventDetails, ClosingSection, BotanicalDivider, MusicController
```
