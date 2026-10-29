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

## 3. Screen B: Library as the booth interior

Existing Library content unchanged, laid out as in the mock: 3-column grid `24px 1fr 24px`, tube lights left and right (glow brighter when 4 picked), white bezel with 3 px ink border and radius 32 holding chips + tile grid (`auto-fill, minmax(160px, 1fr)`), bottom counter in pink with ink border holding the dark tray (4 cells) and the two buttons (Add pictures · Start shooting, primary at 50 % opacity until 4 picked).

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
