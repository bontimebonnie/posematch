# Booth landing + booth-styled Library (Phase C, first element)

> Brief v2, 2026-10-28. Replaces v1 (sign above the doors, gingham curtain). Agreed with Bonnie on the interactive mock at
> https://claude.ai/artifact/9jEgTXVfmNXxy2QYVjR3QF (version 3). A copy of the mock's page code is at
> [mocks/booth-web.html](mocks/booth-web.html); open it in a browser to see every measurement, colour and the fold motion.
> Earlier versions, for reference only: v1 https://claude.ai/artifact/7efU7qH4mXFRoHCJJjfrsV · v2 https://claude.ai/artifact/Jrm2KMgJAaivUvaNdJPx6E.
> Companion research: [photobooth-flows.md](photobooth-flows.md).

## 1. Flow change

```
before:  Library ──▶ Pick 4 ──▶ Shoot ──▶ Result
after:   Booth (new) ──drag curtain──▶ Library (inside the booth) ──▶ Pick 4 ──▶ Shoot ──▶ Result
```

- Booth shows once per launch. Back from Library goes to Booth; Back from Shoot still goes to Library.
- Shoot and Result are untouched this round.
- Desktop/web first (Bonnie's words: the drawing "takes up the whole page on web"). Phone layout is a follow-up; the mock collapses below 760 px to one column and hides the mirror and polaroids.

## 2. Screen A: Booth (landing)

Three columns across the full viewport: locker door · doorway with curtain · locker door. Column ratio 1 : 1.15 : 1, 24 px page gutter. Light comes from the **upper left**; every shadow and highlight follows it. A faint paper grain sits over the whole screen (SVG `feTurbulence`, multiply, ~18 %).

### Palette (from the Chiikawa sheet; these become `decor-*` tokens, see DESIGN-SPEC §4.8)

| token | hex | use |
|---|---|---|
| `decor-cream` | `#fff8e7` | page, curtain base |
| `decor-paper` | `#fffdf5` | curtain fabric |
| `decor-ink` | `#5a4a42` | all lines, embroidery thread |
| `decor-pink` / `-deep` | `#f9c6cf` / `#f29cb0` | curtain stripes, header band, accent button |
| `decor-blue` / `-deep` | `#bcd8ee` / `#8fb8dd` | curtain stripes, mirror, tape |
| `decor-yellow` | `#fde8a6` | note, tube lights |
| `decor-mint` · `decor-lilac` · `decor-peach` | `#cfe8c6` · `#ddd0ea` · `#fbd9c3` | polaroid backgrounds, tiles |
| `decor-metal` / `-dark` | `#f3eee2` / `#d9d2c2` | locker door, frame, hinges, plates |
| `decor-dark` | `#4a3b36` | doorway interior, tray |

### Locker doors (both identical in structure)

| part | spec |
|---|---|
| Frame | `decor-metal-dark`, 10 px, radius 8, bevel: inset 2 px white top-left, inset 2 px ink-15 % bottom-right, drop shadow 12/18/28 ink-22 % |
| Door | gradient `#fffdf6 → metal → #ece5d3` at 100°, radius 6, inset highlights/shadows as frame |
| Hinge | **right edge** of both doors, 14 px wide, 12 %–88 % height, chrome gradient, two knuckle caps |
| Handle + padlock | **left side** of both doors (not mirrored), handle 14×90 at 46 % height, padlock 44 px round below it with shackle |
| Number plate | top centre, 92×38 pill, embossed, hand font "No. 04" / "No. 05" |
| Vents | 3 slats top and 3 slats bottom, 13 px tall, inset shadow, 56 % door width |
| Left door extras | round mirror (52 % width, blue radial, white rim, highlight) — **no text on or near it**; 2×2 polaroids of cartoon poses, two held with blue tape, each rotated ±2–3° |
| Right door extras | yellow "how to use" note, 4:5, taped at top-right corner, rotated −3°; tap → How-to card (3 steps) |
| Stickers | **none for now.** Bonnie adds these in a later pass |

### Doorway + curtain

| part | spec |
|---|---|
| Doorway | dark radial (`#6a5750 → decor-dark`), 10 px metal inner frame, deep inner shadow. Bottom 30 %: floor in two browns (48 px planks) with a top inner shadow. **No lights.** |
| Rod + rings | chrome rod at top 18 px, rings every 36 px |
| Curtain | one continuous piece, hangs **74 %** of doorway height; the bottom quarter is open. Vertical stripes on paper: blue 14 px · gap 14 · pink 8 · gap 20 (56 px repeat). Pink header band 26 px with dashed stitch line. Wavy hem (14 px half-circles). **No dark seams.** |
| Pleats | overlay above the lettering: repeating 36 px band of shadow (multiply, ink 0→30 %→0) plus a thin screen highlight, so fabric *and letters* pick up the folds |
| Lettering | **Stitch, recoloured (Bonnie's choice).** "pose match / photobooth", hand font, embroidered straight on the fabric: satin fill in brown thread (`#7a665c` / `#a08c80` diagonal), 3 px dashed `decor-ink` outline. Placed 16 %–62 % of curtain height. Later replaced by Bonnie's lettering PNG run through the same stitch treatment. Rejected: printed multicolour letters; sewn-on patch |
| Hint | hand font, cream with soft shadow, arrow icon, "Swipe the curtain to enter · 滑開簾子進入", centred in the open quarter. Copy and any buttons to be polished later |

### Motion

- Drag left on the curtain: it **folds like an accordion toward the left edge** (`scaleX`, origin left), following the pointer 1:1, from 1.0 down to 0.1.
- Release past 50 % of its width → snaps to the 10 % folded stack (420 ms, `cubic-bezier(.2,.8,.2,1)`), stays visible at the left, Library fades in after 300 ms.
- Release before 50 % → springs back (180 ms ease-out).
- Tap without drag → small squeeze (scaleX .96 → 1.01 → 1, 450 ms) as a hint. No rotation anywhere.
- Back from Library → curtain unfolds (same snap curve).
- `prefers-reduced-motion`: no transitions; curtain jumps between open and closed.
- No motion library needed; pointer events + CSS transform.

## 3. Screen B: Library as the booth interior (Bonnie's sketch 2)

Same materials and light as Screen A. Existing Library content unchanged; it lives inside the screen.

| part | spec |
|---|---|
| Back wall | cream metal panels: `#f7f0df` with a 4 px `#efe6d2` seam every 160 px |
| Screen | rounded metal bezel (radius 36, 22 px thick, same gradient and bevel as the locker doors, drop shadow 14/20/32 ink-25 %), small pink power dot at the bottom centre. Inside it the "glass": white, 3 px ink border, radius 22, faint blue inner glow at the top. Glass holds the top bar (Back · "Pick N of 4" · chips right-aligned) and the tile grid (`auto-fill, minmax(150px, 1fr)`), which scrolls inside the glass |
| Tube lights | one each side of the screen, 44 px wide, 78 % of the wall height, pill shape with metal caps top and bottom. Warm cream glow at rest; **brighter yellow glow when 4 are picked** |
| Ledge | 34 px strip under the wall, lighter metal, 3 px borders, soft upward shadow: the counter top seen from slightly above |
| Counter front | 150–210 px tall, darker metal with an inset frame line. Buttons on the left (Add pictures · Start shooting, primary at 50 % until 4 picked). **Slanted tray on the right**: cream metal box tilted toward the viewer (`perspective(700px) rotateX(14deg) skewX(-3deg)`), ink border, dark print slot at the top. Inside: the strip as it will print, **four rows × two columns**. **Left column = the picked pose**: each cell fills with that pose's colour and shows its number (1–4) in a small badge at its top-left. **Right column = the photo you will take**: dotted placeholder with a tiny camera outline. Unpicked rows stay dashed and faded. The tray is narrow (about 24 % of the counter) so the strip fills it. Hand-font caption above: "your strip comes out here" |

Layout: `grid-template-rows: 1fr auto` (wall, counter); wall is `1fr minmax(0, 76%) 1fr` (light, screen, light).

## 3b. Shoot, Result, Decorate inside the booth (mock v8, first draft, not yet approved)

All three reuse the interior chrome of §3 (wall, tube lights, bezel + glass, ledge, counter, tray). Only the glass content and the counter buttons change. The existing Shoot/Result logic is untouched; this is the skin.

| screen | glass | counter |
|---|---|---|
| **Shoot** | Top bar: Back · "Shot N of 4" · hand-font sub "match the pose on the left". Body: **reference card** on the left (30 %, the picked pose on its colour, number badge, caption "reference pose") and the **viewfinder** on the right (dark rounded panel, dashed circle "you, in the mirror", Mirror chip top-left, Flip button top-right, big countdown number centred, white flash on capture). Bottom row: timer segmented control **No timer · 3 s · 5 s**, "Retake this one" ghost button, round pink **shutter** on the right | Left: hand-font note "each shot drops into the strip on the right". Right: the tray strip; each capture fills the right-column cell of the current row |
| **Result** | Top bar: Back · "Your strip" · sub "developing…" → "done". Body: the strip large (4 × 2, left pose art on its colour, right photo), **developing reveal** 1.6 s (sepia, low contrast → full), side notes "left: the pose / right: you" and "1080 × 1350 / 4 : 5" | Buttons: **Retake all · Decorate · Save** (primary). The tray strip **ejects** upward out of the slot (700 ms) when the screen opens |
| **Decorate** (Phase C) | Top bar: Back · "Decorate" · segmented **Frame · Stickers** on the right. Body: strip on the left, tools panel on the right. Frame tab: four swatches (white, pink, blue, yellow) that recolour the strip's paper. Stickers tab: six stickers; tap drops one at a random spot and tilt on the strip | Buttons: **Cancel · Done** (primary). Note "frames and stickers are Phase C" |

Flow: Library (4 picked) → Start shooting → Shoot ×4 → Result → Decorate → Done → Result → Save (share sheet / Downloads per Task 37). Back from Shoot and Result goes to Library; Back from Decorate goes to Result.

Open for Bonnie: sticker drag/resize (research says yes, mock only taps), whether Decorate is a separate screen or a sheet over Result, and the Save confirmation.

## 4. Assets from Bonnie (later, not blocking)

| # | asset | size | notes |
|---|---|---|---|
| 1 | Curtain lettering "pose match photobooth" | 1200×540 px, transparent, `decor-ink` line | replaces the SVG text; code applies the stitch fill |
| 2 | Pose drawings for the polaroids | 4–6 × 256×256 px | replace the placeholder blobs |
| 3 | Stickers | 128×128 px each, transparent | placed in a later pass |
| 4 | Optional: tileable grain | 512×512 px | replaces the SVG noise |

## 5. Decisions taken

- Style: cream lockers + pleated curtain in the current palette (not Y2K, not full Japanese-cute, not line doodle).
- Lettering: stitch, recoloured in brown thread.
- Entry gesture: drag only, no button. Curtain folds to the side, never slides off or rolls up.
- Locks on the left of both doors; hinges on the right.
- No stickers, no door labels, no lights in the doorway for this round.

## 6. Done looks like

- Launch → Booth; drag curtain past half → folds left, Library inside the booth; Back → unfolds.
- All colours via `decor-*` tokens; `design-tokens.test.ts` passes; no new dependency.
- `docs/design/` has 1280-wide screenshots: Booth closed, half-folded, open; Library inside.
- Bonnie on desktop: the curtain feels like fabric folding, not a panel sliding.
