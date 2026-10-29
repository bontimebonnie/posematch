# Photobooth web app flows vs Post Match

> Research for Phase C "decor". Walked three free web photobooths on 2026-10-28 in the desktop browser pane (camera is blocked there, so the camera step on each site was read from its page source and the rest of each flow was driven through the site's own upload path). Post Match screens were checked on the dev build with four seeded library images. Mobile layouts were not compared (Bonnie asked to focus on the website version).

Sites: [Nashallery's Booth](https://photobooth.nashallery.com/) · [Whee! Photobooth](https://wheephotobooth.com/) · [MySketchBooth](https://mysketchbooth.com/)

---

## 1. Screen-by-screen flows

### 1.1 Nashallery's Booth (single hand-drawn "Under the Sea" theme)

Static HTML pages, one theme, 2 shots, no retake. The whole app is a decorated frame first and a camera second.

| # | Screen (URL) | What is on it | Primary button and position | Notes |
|---|---|---|---|---|
| 1 | Landing `index.html` | Logo top-centre, a tilted mock photo strip with three fish and bubbles that animate on hover/press of the button | **Select** (outlined pill, bottom-centre) | The strip is a 16-frame flip-book animation. Only one theme exists, so "Select" is really "Start". Fish/bubbles are pure decoration. |
| 2 | Menu `menu.html` | Theme title as hand-lettered pink word art, two stacked full-width outlined buttons | **Take photos** (top), Upload photos below | Camera and upload are equal weight. No layout choice (fixed 2-up, 4:5 strip at 1176×1470). |
| 3 | Camera `camera.html` | Full theme frame (fish tank) with the live video placed inside the top cell. Countdown number sits in a tab on the frame top edge. | **Capture** (outlined pill, bottom-centre) | Pressing Capture starts a 3-2-1 countdown then shoots. Video is mirrored. After shot 1 the video moves to the bottom cell. No retake, no timer choice, no flip camera. Camera failure is a browser `alert`. |
| 4 | Upload `upload.html` | Same frame, file picker fills cells top then bottom | **Upload Photo**; **Ready** appears once both cells are filled | Upload is a mirror of the camera flow with the same frame overlay. |
| 5 | Final `final.html` | Heading "Add Stickers! (drag to reposition)", a row of five sticker buttons (Fish, Octopus, Seaweed, Axolotl, Bubble) plus Reset, the finished canvas, then Download / Home | **Download** (bottom-left of the pair), Home beside it | Stickers are theme-matched, placed at canvas centre at 40% size, dragged with pointer events, last added is on top. No resize/rotate, no delete per sticker (Reset clears all). Strip is passed between pages via `localStorage` data URL. No share, no print, no QR. |

Takeaways: the frame overlay is live on the camera so you see yourself inside the decor while posing; stickers come from the same illustration set as the frame; the decoration carries the whole personality with a very small UI.

### 1.2 Whee! Photobooth (template-driven, Korean 4-cut style)

React SPA with the most complete flow of the three. Camera auto-takes all shots in sequence.

| # | Screen (URL) | What is on it | Primary button and position | Notes |
|---|---|---|---|---|
| 1 | Home `/` | Title, tagline "Pose. Capture. Repeat.", top-right icon bar (home / about / blog / contact / feedback), SEO copy and FAQ below the fold | **START** (pink pill, centre) with a seasonal **🎃 SPOOKY** button beside it | A "New Updates" modal with an email field and "Skip for now" appears on first visit. Uses emoji in buttons (we would not). |
| 2 | Your Frame `/layout` | Segmented tabs **Templates · Halloween · Build Your Own**. Templates tab: a swipeable carousel of frame art with "1 pic / 2 pics / 4 pics" badges, "NEW" tags, a dot pager and the template name under the card. Build Your Own: 2×2 grid Solo / Duo / Trio / Quad, a live preview of the empty strip, 17 frame colour swatches plus a "Sliders" button for custom colour. | **USE THIS TEMPLATE** / **NEXT →** (pink pill, bottom-centre); ← Back top-left | Layout choice and frame choice are one step. Picking a layout changes the shot count. The preview updates with the swatch colour immediately. |
| 3 | Strike a Pose `/camera` | Large rounded viewfinder (4:3-ish), on its right edge a vertical column of numbered dashed slots 1-4 (the active one is tinted pink). Under it: FLIP · UPLOAD · big round pink **Capture** · TIMER segmented Off / 3s / 5s / 10s · caption "4 shots will be taken automatically". Below: a horizontally scrolling filter strip of 36 named thumbnails (Normal, Bubbles, Hearts, Sparkles, Snow, Fireflies, Soft Film, Moody Mono, … Candy) with live preview on the camera. | **Capture** (large round, centre of the control row) | One press takes all four shots back to back using the chosen timer. Filled slots show the thumbnail and the title becomes "Frame N — tap to replace": retake is per slot by tapping it. Upload opens a file picker, then a **Crop to fit frame** overlay (dark scrim, drag to reposition, Zoom slider, caption "What you see is what appears in your strip (1.49 : 1)", Cancel / **Apply**). |
| 4 | Your Strip! (same route, result state) | The finished strip on the left, a marquee banner "Follow on Instagram @wheephotobooth ✦" above, four stacked pill buttons: RETAKE, DOWNLOAD, SHARE, **CUSTOMISE** | **Customise** (filled pink, last in the stack); Download and Share are secondary | Retake goes back to the camera with the slots kept. A second popup asking for an email appears after a delay on the first strip. |
| 5 | Doodle your strip `/customise` | Left: a vertical tool palette (Pen, Eraser, Glow, Undo, Redo, Size 6/12/20, colour picker). Centre: the strip. Right: a paginated sticker sheet (seasonal icons and letter tiles A–F, "Drag onto strip", prev/next). Bottom: DOWNLOAD · **SHARE** | **Share** (filled pink, right of Download) | Stickers are placed by drag, then have handles to resize, rotate and remove. Doodling is a free-hand canvas layer with a glow brush. |
| 6 | Share behaviour | – | – | Share tries `navigator.share` with the PNG file; if files are not shareable it shares the site URL; else copies the URL and shows an alert "Link copied". Download is a PNG. No print, no QR. |

Takeaways: layout and frame are chosen before the camera; auto-sequence capture with a chosen timer; per-slot retake; a dedicated decoration step after the result with stickers that can be moved, resized and rotated; filters are a camera-time choice with live preview.

### 1.3 MySketchBooth (hand-drawn vintage booth, skeuomorphic)

React SPA. Every screen is drawn as the inside of a real photobooth; the "coin panel" on the right is the only action button and its label changes per step.

| # | Screen (URL) | What is on it | Primary button and position | Notes |
|---|---|---|---|---|
| 1 | Landing `/` | A line-drawn booth exterior: "PHOTOBOOTH" sign, a "featured strips" lightbox showing real user strips, a curtain, a coin slot, footer links | **enter →]** (outlined button on the curtain, centre-right) | A "follow me on Instagram/TikTok" modal appears after 3 s with "Maybe later" (stored so it shows once). Ads in the footer. |
| 2 | Frame selection `/frameSelection` | Booth interior: a lightbox labelled "eye level", a carousel ‹ › of frame previews (black, white, seasonal, stars, hearts, cutout, doodle, birthday, sketchbooth), a "b&w / color" toggle switch, a "$0 = 4 pics" price sticker, a three-step instruction card, coin panel labelled **select** with a green button | **green coin-panel button** (right side, labelled "select") | The instruction card ("1 Choose b&w or color … 2 Choose a frame … 3 Press the green button") is the onboarding. Filter is a single binary toggle, chosen before shooting. |
| 3 | Choice `/select` | Same booth; the screen shows two buttons | **take photo** (top), upload photo below | Coin-panel light turns red (no action available yet). |
| 4 | Take picture `/takePicture` | Mirrored live video in the lightbox, coin panel labelled **start** | **green coin-panel button "start"** | One press takes 4 shots automatically: 3-2-1 countdown as a big white number over the video, a white flash overlay (300 ms) on capture, 2 s pause, next countdown. No retake, no timer choice, no flip. Errors route to a dedicated `/error` page with a title and a plain-language message. |
| 5 | Upload `/upload` | 2×2 "Picture 1-4" dashed slots with "+"; each opens a file picker then a **Crop Image** dialog (rectangle crop with corner and edge handles, cancel / **crop**); filled slots show the photo and read "Replace" | **green coin-panel button "print"** once all four are filled | Fixed-ratio crop; replace per slot. 25 MB limit routes to the error page. |
| 6 | Print strip `/printStrip` | A hand-drawn sign "PHOTOS DELIVERED HERE IN 5 SECONDS" counting down, then the strip slides out of a drawn slot | **Pick up →** (wide outlined button, bottom-centre, appears after the countdown) | Pure theatre: a 5 s fake "developing" wait that sells the booth metaphor. Strip is kept in IndexedDB (localStorage fallback) so a refresh does not lose it. |
| 7 | Pickup `/pickup` | The strip large in the centre with hand-drawn callouts "your photostrip!" and "tag me" (TikTok / Instagram icons), a scissors icon that cuts the strip into four separate PNGs (download `photo-N.png` each), a hidden-on-desktop hint "Press and hold on the image to save directly to your phone!" | **download** · share · print · restart (four small outlined buttons in a row, bottom-centre; none is visually primary) | Share uses `navigator.share` with the PNG file and routes to the error page if unsupported. Print opens a popup that centres the strip on a page and calls `window.print()`. Restart goes back to frame selection. No stickers, no doodle, no QR. |

Takeaways: one consistent metaphor (a real booth) with a single physical "coin button" whose label changes; onboarding is drawn into the set; the fake developing wait and "pick up" step turn the result into a reward; share/print/individual-photo download are all on one screen; the b&w filter is set before shooting, not after.

### 1.4 Post Match today (for comparison)

| # | Screen | What is on it | Primary button and position |
|---|---|---|---|
| 1 | Library (empty) | Header "Post Match" with language toggle, filter chips All / 1 person / 2 people, white empty-state card (icon, "No pictures yet", one line of copy), bottom bar: Add pictures · paste icon · Start shooting | **Start shooting** (accent pill, bottom-right; disabled until there are pictures) |
| 1b | Library (with pictures) | Character chips row, 3-column 3:2 tile grid with character badge, Select in header | **Start shooting** (bottom-right) |
| 2 | Crop | 3:2 cropper on dark card, hint line, "Cut another from this picture", Keep whole / **Cut and continue** | **Cut and continue** (bottom-right of pair) |
| 3 | Import | Review of cut pieces, "How many characters?" segmented control, character name field | **Add to library** (full width bottom) |
| 4 | Pick (Library in pick mode) | Header "Pick 1 of 4", tiles get a numbered badge, bottom Tray of four slots with reorder arrows and remove | **Start** (accent pill, full width under the tray; disabled until 4 picked) |
| 5 | Shoot | Header "Shot N of 4" with Mirror chip and Flip camera; reference cartoon on top, viewfinder below with a scrim marking the 3:2 band; four thin progress bars; bottom: Take photo · **3s timer** | **3s timer** (accent, bottom-right); after a shot: Retake · **Next/Done** |
| 6 | Result | Header "Your strip is ready!", the 4:5 strip, bottom: Retake all · Copy image · **Save** | **Save** (accent, bottom-right) → share sheet on mobile, download on desktop |

Post Match has no landing, no frame/layout choice, no filter step, no decoration step, no print, no QR, and no onboarding beyond the empty-state line. It is the only one of the four with a reference image on the camera screen, per-shot review before moving on, a library, and a copy-to-clipboard action.

---

## 2. Gap list (ranked by value for a personal Instagram-strip app)

| Rank | Missing screen or step | Who has it | Why it matters for Post Match | Effort |
|---|---|---|---|---|
| 1 | **Decoration step after the result** (stickers placed by drag, then moved; optional resize/rotate/remove) | Nashallery (simple), Whee (full) | This *is* Phase C. The 4:5 output already leaves a top and bottom margin designed for decor. Both sites put stickers on the finished strip, not on the camera, which keeps the Shoot screen clean. | Medium: canvas layer over the composed strip, re-export. |
| 2 | **Frame / border choice** (a few illustrated frames that wrap the strip) | all three | The strip currently sits on plain white. A frame is the single biggest visual change per unit of work and matches the "Chiikawa sticker-book" direction. Nashallery shows a frame can carry the whole look. | Medium: PNG/SVG overlay at 1080×1350 with the eight 3:2 cells cut out. |
| 3 | **Fake "developing" moment before the result** | MySketchBooth (5 s countdown, "Pick up") | Cheap delight. Post Match already has a "Putting your strip together…" state; turning it into a short animated reveal (strip sliding up from the bottom) gives the Result screen the reward feel. | Small. |
| 4 | **Timer choice** (Off / 3 s / 5 s / 10 s) and **auto-sequence** (one press takes all four) | Whee (choice + auto), MySketchBooth (auto only) | Post Match's two buttons ("Take photo" / "3s timer") are the same idea with one option. A 5 s or 10 s option helps when the phone is propped up. Auto-sequence conflicts with our reference-image-per-shot flow (you need to look at the next pose), so take the timer choice, skip auto. | Small. |
| 5 | **Per-slot retake from the result** (tap a cell to reshoot just that one) | Whee ("tap to replace"), MySketchBooth upload ("Replace") | We only offer "Retake all". Reshooting one bad frame out of four is a very common need. | Medium: Result needs to re-enter Shoot at an index. |
| 6 | **Filters** (colour grading applied to the photos) | Whee (36 live), MySketchBooth (b&w toggle) | Nice for IG, but our left column is a cartoon and a filter on the right column only can look odd. A single "soft film" tone or a b&w toggle applied to the real-photo cells is enough. | Small for one preset; larger for a filter strip. |
| 7 | **Landing / start screen with a strip preview** | all three | They need it because they are public sites. For a personal PWA the Library is the home; a landing would add a tap. An empty-state illustration does the same job. | Skip as a screen, keep as an illustration. |
| 8 | **Onboarding card** (three numbered steps drawn into the set) | MySketchBooth | Only useful for first-time friends. Could be a one-time three-line card in the empty state. | Small. |
| 9 | **Print** (`window.print` popup) and **individual-photo download** (scissors) | MySketchBooth | Print is irrelevant for IG. Scissors is cute but the 3:2 cells are already in the Library as references and real photos are not kept. | Skip. |
| 10 | **QR code** to send the strip to a phone | none of the three | None of the sites do it; our Save already opens the share sheet on the phone itself. | Skip. |
| 11 | **Doodle / free-hand pen layer** | Whee | Fun but a big input surface to get right on touch, and it fights the clean sticker-book look. | Skip for now. |
| 12 | **Follow / email popups, marquee banners, ads** | Whee, MySketchBooth | Not applicable. | Skip. |

---

## 3. What to copy, what to skip (tied to the Phase C decor plan)

### Copy

1. **Decorate on the Result, not on the camera.** Both Whee and Nashallery add stickers after the strip exists. For Post Match: keep Shoot exactly as it is and add a **Decorate** step between composing and saving. Suggested shape: the strip in the centre, a single horizontal **sticker tray** at the bottom (same `Tray` component, 3:2 tiles become square sticker tiles), tap a sticker to drop it on the strip, drag to move. Resize/rotate can come later; Nashallery proves tap-to-add plus drag is already fun. One accent button: **Save** (Decorate replaces the Result's third button; Copy image moves to a secondary row or stays as an icon button).
2. **Frames as the first decor element.** A frame picker is a horizontal row of 3–5 thumbnails (Whee's carousel is overkill for a personal set). Put it on the same Decorate screen as a segmented control **Frame · Stickers** rather than as a separate pre-camera step, because our strip layout is fixed at 4×(cartoon + photo) and there is nothing else to choose up front. Frame art fills the top and bottom margins of the 4:5 canvas and the gutters between cells, exactly where the spec already reserves space. Use Chiikawa-style pastel line art; the Nashallery fish tank shows a frame can include small characters peeking into the gutters.
3. **A short "developing" reveal.** Replace the plain "Putting your strip together…" text with a 1–2 s animation on the cream background: the strip slides up into view and settles (MySketchBooth's slot, done with our `duration-base` tokens and nothing else). Respect `prefers-reduced-motion` (already global).
4. **Timer choice as a segmented control, keep the single-shot flow.** Replace "Take photo / 3s timer" with one accent **Shutter**-style button plus an Off / 3s / 5s segmented control (the spec's deferred `Shutter` component fits here). Do not auto-sequence: the reference image changes per shot and the user needs the review step.
5. **Retake one cell.** On the Result (or Decorate) screen let a tap on a photo cell reshoot only that index. Whee's "Frame N — tap to replace" wording is a good model for the copy.
6. **Per-step onboarding copy, not a screen.** MySketchBooth's three-step card is effective because it is in the set. For us: a three-line hint inside the empty-state card ("Add cartoon poses · Pick 4 · Shoot and decorate") covers first use without a landing page.

### Skip

- **Landing page / "Select" / "enter" screens.** Public sites need a front door; a home-screen PWA does not. The Library is the home.
- **Layout picker (Solo/Duo/Trio/Quad, frame colour sliders).** Post Match's strip is a fixed 4-row cartoon/photo pairing; that pairing is the product. A colour picker also breaks the five-pastel palette rule.
- **Big filter strip.** 36 filters with emoji names is the opposite of one accent and Iconoir-only. If a filter is wanted later, one "soft film" preset applied to photo cells only, as a toggle chip on Decorate.
- **Doodle pen, glow brush.** Heavy touch-input work, and hand-drawn scribbles fight the printed-sticker look.
- **Print, individual-photo download, QR.** Not an IG need and nothing to print at home.
- **Pre-camera frame overlay on the viewfinder** (Nashallery). Our viewfinder already shows the reference cartoon and a 3:2 scrim; adding a frame would crowd it and the frame is applied at compose time anyway.
- **Emoji in UI, marquee banners, follow prompts, email capture.** Against project rules and irrelevant for a personal app.

### Design-system notes for the Decorate screen

- Grid: strip centred with `px-4`; sticker tray height 64 + safe area; sticker tiles 48 with `gap-2` (all on the 8pt grid).
- Icons: Iconoir only. Suggested: `Sparks` or `Star` for the Stickers tab, `Frame` / `FrameAltEmpty` for Frames, `Undo` for remove-last, `Download` for Save, `Copy` for Copy image.
- Tokens: stickers and frames live under a separate `decor-*` namespace as the design spec already reserves (§4.8), so they can be switched off with one flag.
- One accent button per screen: **Save** on Decorate; Retake / Copy are secondary pills.

---

## 4. Top five takeaways

1. Every booth decorates **after** the strip exists, never on the camera. Post Match should add a Decorate step after Result and leave Shoot alone.
2. A **frame** is the highest-impact decor element and the 4:5 margins are already reserved for it. Start Phase C with frames, then stickers.
3. **Tap-to-add then drag** is enough for stickers (Nashallery); resize/rotate (Whee) can wait.
4. A one-to-two-second **"developing" reveal** before the strip appears is cheap and is the moment users remember (MySketchBooth).
5. Add a **timer choice** and **per-cell retake**; skip layout pickers, filter strips, doodling, print, QR and landing pages, which exist on those sites because they are public products, not personal tools.
