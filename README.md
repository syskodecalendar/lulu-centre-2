# Lulu Center Premium Scroll Website

A hybrid cinematic + smooth scrolling website built from the supplied **LULU CENTER FINALV.pdf** content and extracted visual assets.

## Scroll structure

1. Home + Welcome — cinematic zoom / portal transition
2. Property at a Glance — smooth scrolling
3. Experience + Why Lulu — cinematic card-to-fullscreen transition
4. Ground Floor + First Floor — smooth scrolling with parallax/reveals
5. Hypermarket + Tenant Mix + Food & Leisure — cinematic multi-scene sequence
6. Facilities — smooth scrolling
7. 3D Walkthrough — cinematic zoom
8. Access + Future Connectivity + Contact — smooth scrolling

## Animation stack
- Lenis for smooth scrolling
- GSAP + ScrollTrigger for scroll-scrubbed cinematic animation
- Native graceful fallback if animation CDNs are unavailable

## Fonts
The layout is configured for `Jassime` headings and `Inter` body copy. Jassime is a commercial font, so its licensed webfont file is **not bundled**. Add your licensed Jassime webfont via `@font-face` in `styles.css`. Until then, the site falls back to Cormorant Garamond for a similar editorial serif feel.

## 3D walkthrough
Set the final URL in `script.js`:

```js
const walkthroughUrl = 'YOUR_URL_HERE';
```

## Run locally
Use a local server instead of opening with `file://` for best results:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.
