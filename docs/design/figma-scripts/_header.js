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
