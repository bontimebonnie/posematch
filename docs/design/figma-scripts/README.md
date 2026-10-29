# Figma scripts (run in the Scripter plugin)

Figma's MCP connector is capped on the Starter plan, so the remaining frames are
built by pasting these scripts into **Plugins → Scripter** inside
`ai-project` (file `KpFjgemvCMZH0JUlZNJFSU`). They use the same Plugin API code the
MCP ran; `_header.js` holds the two shims that make them work outside the MCP.

Run order (each one is safe to run again):

| # | file | what it does |
|---|---|---|
| 1 | `01-cleanup.js` | deletes the two failed HTML-import frames (160:810, 161:810), parks the two good ones as "REF · …", clips the character chip rows on the phone screens |
| 2 | `02-booth-landing.js` | Booth landing 1280×800 at (0, 2400) + a half-folded copy to its right |
| 3 | `03-booth-interior.js` | Library inside the booth (interior E, 4×2 tray) at (0, 3300) |

How: open the file on the **Pose match** page → Plugins → Scripter → New script →
paste the whole file → Run. Each takes a few seconds; the last line prints the
node ids it made. If a run throws, read the message, then just run it again — every
script removes its own previous output first.

IDs these scripts depend on (all on the Pose match page): variables
`VariableID:152:*`, component sets Button `154:33`, IconButton `154:46`, Chip `154:59`,
Badge `154:66`, Tile `156:65`, icons `153:*`, art `153:113/124/133/144`.
