// 01 · Cleanup: delete the two failed HTML-import frames, park the two good
// HTML-import frames as reference, and clip the character chip rows on the
// phone screens so they stop poking out of the 390 frame.
// ---- Scripter header: tiny shims so the same scripts run inside Figma's
// Scripter plugin (Plugins → Scripter → paste → Run) without the MCP helpers.
if (!figma.createAutoLayout) {
  figma.createAutoLayout = (dir, props) => {
    if (dir && typeof dir === 'object') { props = dir; dir = 'HORIZONTAL'; }
    const f = figma.createFrame(); f.layoutMode = dir || 'HORIZONTAL';
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
    for (const [k, v] of Object.entries(props || {})) f[k] = v;
    return f;
  };
}
const _page = async (id) => { const p = await figma.getNodeByIdAsync(id); try { await figma.setCurrentPageAsync(p); } catch (e) { figma.currentPage = p; } return p; };
const _done = (x) => { try { print(JSON.stringify(x)); } catch (e) { console.log(x); } };
const page = await _page('150:61');
const out = { removed: [], parked: [], clipped: 0 };
for (const id of ['160:810', '161:810']) { const n = await figma.getNodeByIdAsync(id); if (n) { n.remove(); out.removed.push(id); } }
let y = 3400;
for (const [id, name] of [['162:810', 'REF · landing (HTML import)'], ['163:810', 'REF · interior (HTML import)']]) {
  const n = await figma.getNodeByIdAsync(id); if (!n) continue;
  n.name = name; n.x = 0; n.y = y; y += n.height + 80; out.parked.push(id);
}
for (const n of page.findAll(n => n.type === 'FRAME' && n.name === 'Characters')) { n.clipsContent = true; out.clipped++; }
_done(out);
