// 03 · Library inside the booth (desktop 1280×800), interior E per docs/design/booth-landing.md §3 (mock v7/v8).
// Builds "Booth · Library inside (desktop)" at (0,3300). Safe to re-run.
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
for (const n of [...page.children]) if (/^Booth · Library inside/.test(n.name)) n.remove();
const V = id => figma.variables.getVariableByIdAsync('VariableID:152:'+id);
const [cream, paper, ink, pink, pinkDeep, blue, blueDeep, yellow, yellowDeep, mint, lilac, peach, metal, metalDark, metalDeep, dDark, thread, floor, fg, fgMuted, onDark, raised, line] = await Promise.all([35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,19,20,32,18,22].map(V));
const paint = (v, o) => { const p = figma.variables.setBoundVariableForPaint({ type:'SOLID', color:{r:0,g:0,b:0} }, 'color', v); return o === undefined ? p : { ...p, opacity: o }; };
const hex = h => { const n = parseInt(h.slice(1), 16); return { r: ((n>>16)&255)/255, g: ((n>>8)&255)/255, b: (n&255)/255 }; };
const solid = (h, o) => ({ type:'SOLID', color: hex(h), ...(o === undefined ? {} : { opacity: o }) });
const vgrad = (stops) => ({ type:'GRADIENT_LINEAR', gradientTransform: [[0,1,0],[-1,0,1]], gradientStops: stops.map(([pos, h, o]) => ({ position: pos, color: { ...hex(h), a: o ?? 1 } })) });
const hgrad = (stops) => ({ type:'GRADIENT_LINEAR', gradientTransform: [[1,0,0],[0,1,0]], gradientStops: stops.map(([pos, h, o]) => ({ position: pos, color: { ...hex(h), a: o ?? 1 } })) });
const shadow = (x, y, blur, a, spread = 0, col = '#5a4a42') => ({ type:'DROP_SHADOW', color:{ ...hex(col), a }, offset:{x,y}, radius: blur, spread, visible:true, blendMode:'NORMAL' });
const inner = (x, y, blur, a, col = '#5a4a42', spread = 0) => ({ type:'INNER_SHADOW', color:{ ...hex(col), a }, offset:{x,y}, radius: blur, spread, visible:true, blendMode:'NORMAL' });
await Promise.all(['Bold','Regular','Medium'].map(s => figma.loadFontAsync({ family:'Noto Sans TC', style:s }))); await figma.loadFontAsync({ family:'Patrick Hand', style:'Regular' });
const TS = { title:'S:e33f4c54ee7ac47953d57495ff853abbb0a05f2a,', label:'S:47021115294aefbbe2e53059a73178da0575ae5f,', caption:'S:d0e9c1cfac24d0750b63d7ce15f17c2da2eeb899,', hand:'S:7156dbc4cb15083431c0d95f4737ddfc63b0c715,' };
const text = async (chars, style, fillPaint) => { const t = figma.createText(); t.characters = chars; await t.setTextStyleIdAsync(style); t.fills = [fillPaint]; return t; };
const rect = (parent, name, w, h, x, y, fills, r = 0) => { const n = figma.createRectangle(); n.name = name; n.resize(Math.max(w, 0.01), Math.max(h, 0.01)); n.x = x; n.y = y; n.fills = fills; n.cornerRadius = r; parent.appendChild(n); return n; };
const node = id => figma.getNodeByIdAsync(id); const inst = async id => (await node(id)).createInstance();
const ART = ['153:113','153:124','153:133','153:144'];
const PICKED = 3; // 3 of 4 picked → primary at 50 %, tubes at rest

const W = 1280, H = 800, LEDGE = 34, COUNTER = 192;
const stage = figma.createFrame(); stage.name = 'Booth · Library inside (desktop)'; stage.resize(W, H); stage.x = 0; stage.y = 3300; stage.clipsContent = true; stage.fills = [solid('#f7f0df')];
for (let x = 160; x < W; x += 160) rect(stage, 'Seam', 4, H, x, 0, [solid('#efe6d2')]);
// ---- wall
const wallH = H - LEDGE - COUNTER;
const wall = figma.createFrame(); wall.name = 'Wall'; wall.resize(W, wallH); wall.x = 0; wall.y = 0; wall.fills = []; wall.layoutMode = 'HORIZONTAL'; wall.primaryAxisSizingMode = 'FIXED'; wall.counterAxisSizingMode = 'FIXED'; wall.paddingLeft = 24; wall.paddingRight = 24; wall.paddingTop = 32; wall.counterAxisAlignItems = 'CENTER'; stage.appendChild(wall);
const side = 148, bezelW = W - 48 - side * 2, bezelH = wallH - 32;
const tube = (name) => {
  const colF = figma.createFrame(); colF.name = name; colF.resize(side, bezelH); colF.fills = []; colF.clipsContent = false; wall.appendChild(colF);
  const th = bezelH * 0.78; const t = rect(colF, 'Tube', 44, th, (side - 44) / 2, (bezelH - th) / 2, [hgrad([[0,'#e9e0c8'],[0.35,'#fffdf5'],[0.55,'#fff3c2'],[1,'#e2d8bd']])], 999);
  t.effects = [{ type:'DROP_SHADOW', color:{ ...hex('#d9d2c2'), a:1 }, offset:{x:0,y:0}, radius:0, spread:3, visible:true, blendMode:'NORMAL' }, shadow(0, 0, 18, 0.55, 0, '#fde8a6'), inner(0, 0, 12, 0.9, '#ffffff')];
  for (const y of [t.y - 8, t.y + th - 10]) { const cap = rect(colF, 'Cap', 56, 18, t.x - 6, y, [vgrad([[0,'#ffffff'],[1,'#cfc6b1']])], 6); cap.effects = [shadow(0, 2, 3, 0.3)]; }
  return colF;
};
tube('Tube light · left');
// ---- bezel + glass
const bezel = figma.createFrame(); bezel.name = 'Bezel'; bezel.resize(bezelW, bezelH); bezel.cornerRadius = 36; bezel.clipsContent = false; bezel.layoutMode = 'VERTICAL'; bezel.primaryAxisSizingMode = 'FIXED'; bezel.counterAxisSizingMode = 'FIXED'; bezel.paddingLeft = bezel.paddingRight = bezel.paddingTop = bezel.paddingBottom = 22;
bezel.fills = [{ type:'GRADIENT_LINEAR', gradientTransform: [[0.7,0.7,0],[-0.7,0.7,0.5]], gradientStops: [{ position:0, color:{ ...hex('#fffdf6'), a:1 } }, { position:0.4, color:{ ...hex('#f3eee2'), a:1 } }, { position:1, color:{ ...hex('#e6ddc8'), a:1 } }] }];
bezel.effects = [inner(3, 3, 0, 1, '#ffffff'), inner(-4, -4, 0, 0.14), shadow(14, 20, 32, 0.25)];
wall.appendChild(bezel);
const glass = figma.createFrame(); glass.name = 'Glass'; glass.cornerRadius = 22; glass.clipsContent = true; glass.layoutMode = 'VERTICAL'; glass.itemSpacing = 14; glass.paddingLeft = glass.paddingRight = glass.paddingTop = glass.paddingBottom = 16; glass.fills = [paint(raised)]; glass.strokes = [paint(ink)]; glass.strokeWeight = 3; glass.strokeAlign = 'INSIDE';
glass.effects = [inner(0, 0, 0, 1, '#fffdf5', 6), inner(0, 20, 40, 0.25, '#bcd8ee')];
bezel.appendChild(glass); glass.layoutSizingHorizontal = 'FILL'; glass.layoutSizingVertical = 'FILL';
const dot = figma.createEllipse(); dot.name = 'Power dot'; dot.resize(10, 10); dot.fills = [paint(pinkDeep)]; dot.effects = [shadow(0, 0, 8, 1, 0, '#f29cb0')]; bezel.appendChild(dot); dot.layoutPositioning = 'ABSOLUTE'; dot.x = (bezelW - 10) / 2; dot.y = bezelH - 8 - 10;
// top bar
const top = figma.createAutoLayout('HORIZONTAL', { name:'Top bar', itemSpacing: 12 }); top.fills = []; top.counterAxisAlignItems = 'CENTER'; glass.appendChild(top); top.layoutSizingHorizontal = 'FILL';
const back = await inst('154:34'); top.appendChild(back); back.setProperties({ 'Icon#154:14': '153:6' });
const title = await text(`已選 ${PICKED} / 4 張`, TS.title, paint(fg)); top.appendChild(title); title.layoutSizingHorizontal = 'FILL';
for (const [id, label] of [['154:49','全部'],['154:47','1 人'],['154:47','2 人']]) { const c = await inst(id); top.appendChild(c); c.setProperties({ 'Label#154:19': label }); }
// grid 5 × 2
const innerW = bezelW - 44 - 32; const cols = 5, gap = 12; const tw = Math.floor((innerW - gap * (cols - 1)) / cols), th = Math.round(tw * 2 / 3);
const grid = figma.createAutoLayout('VERTICAL', { name:'Grid', itemSpacing: gap }); grid.fills = []; glass.appendChild(grid); grid.layoutSizingHorizontal = 'FILL';
let k = 0;
for (let r = 0; r < 2; r++) { const row = figma.createAutoLayout('HORIZONTAL', { name:'Row', itemSpacing: gap }); row.fills = []; grid.appendChild(row);
  for (let c = 0; c < cols; c++, k++) { const picked = k < PICKED; const t = await inst(picked ? '156:49' : '156:33'); row.appendChild(t); t.resize(tw, th); const img = t.findOne(n => n.name === 'Image' && n.type === 'INSTANCE'); if (img) img.swapComponent(await node(ART[k % 4])); t.setProperties({ 'Show name#156:0': k % 2 === 0 }); const nm = t.findOne(n => n.name === 'Name' && n.type === 'INSTANCE'); if (nm) nm.setProperties({ 'Label#154:26': k % 4 < 2 ? 'Chiikawa' : 'Hachiware' }); if (picked) { const o = t.findOne(n => n.name === 'Order' && n.type === 'INSTANCE'); if (o) o.setProperties({ 'Label#154:26': String(k + 1) }); } } }
tube('Tube light · right');
// ---- ledge
const ledge = rect(stage, 'Ledge', W, LEDGE, 0, wallH, [vgrad([[0,'#fffdf6'],[1,'#efe6d2']])]); ledge.effects = [shadow(0, -6, 12, 0.08), inner(0, 3, 0, 1, '#d9d2c2'), inner(0, -3, 0, 1, '#cfc6b1')];
rect(stage, 'Ledge line', W - 48, 2, 24, wallH + 6, [solid('#5a4a42', 0.12)]);
// ---- counter front
const cf = figma.createFrame(); cf.name = 'Counter front'; cf.resize(W, COUNTER); cf.x = 0; cf.y = wallH + LEDGE; cf.fills = [vgrad([[0,'#ebe3cf'],[1,'#ddd4bf']])]; cf.effects = [inner(0, 10, 14, 0.12)]; cf.clipsContent = false; stage.appendChild(cf);
const frameLine = rect(cf, 'Inset frame line', W - 64, COUNTER - 36, 32, 18, [], 10); frameLine.strokes = [solid('#5a4a42', 0.18)]; frameLine.strokeWeight = 3;
const actions = figma.createAutoLayout('HORIZONTAL', { name:'Actions', itemSpacing: 12 }); actions.fills = []; actions.counterAxisAlignItems = 'CENTER'; cf.appendChild(actions); actions.x = 48;
const add = await inst('154:13'); actions.appendChild(add); add.setProperties({ 'Label#154:0': '新增圖片', 'Icon#154:7': true }); const ai = add.findOne(n => n.name === 'Icon' && n.type === 'INSTANCE'); if (ai) ai.swapComponent(await node('153:13'));
const start = await inst('154:3'); actions.appendChild(start); start.setProperties({ 'Label#154:0': '開始拍攝', 'Icon#154:7': true }); start.minWidth = 200; if (PICKED < 4) start.opacity = 0.5;
actions.y = (COUNTER - actions.height) / 2;
// ---- slanted tray (perspective/skew live in code; Figma gets a 2° tilt)
const TW = 260, TH = Math.round(COUNTER * 0.86);
const tray = figma.createFrame(); tray.name = 'Tray (perspective 700px rotateX 14° skewX −3° in code)'; tray.resize(TW, TH); tray.x = W - 48 - 8 - TW; tray.y = COUNTER - TH - 4; tray.cornerRadius = 10; tray.clipsContent = false; tray.fills = [vgrad([[0,'#fffdf6'],[1,'#efe6d2']])]; tray.strokes = [paint(ink)]; tray.strokeWeight = 3; tray.strokeAlign = 'INSIDE'; tray.effects = [shadow(10, 12, 20, 0.3), inner(0, 0, 0, 1, '#f7f0df', 6)]; cf.appendChild(tray); tray.rotation = 2;
const slot = rect(tray, 'Print slot', TW - 36, 14, 18, 12, [paint(dDark)], 7); slot.effects = [inner(0, 3, 4, 0.6, '#000000')];
const outH = TH - 12 - 14 - 10 - 14; const sH = outH, sW = Math.round(sH * 3 / 4);
const strip = figma.createFrame(); strip.name = 'Strip preview (4 rows × pose | photo)'; strip.resize(sW, sH); strip.x = (TW - sW) / 2; strip.y = 12 + 14 + 10; strip.cornerRadius = 4; strip.fills = [solid('#ffffff')]; strip.strokes = [paint(ink)]; strip.strokeWeight = 2; strip.strokeAlign = 'INSIDE'; strip.layoutMode = 'VERTICAL'; strip.primaryAxisSizingMode = 'FIXED'; strip.counterAxisSizingMode = 'FIXED'; strip.itemSpacing = 4; strip.paddingLeft = strip.paddingRight = strip.paddingTop = strip.paddingBottom = 8; tray.appendChild(strip);
const poseFill = [mint, blue, yellow, lilac];
for (let r = 0; r < 4; r++) { const row = figma.createAutoLayout('HORIZONTAL', { name:'Row ' + (r + 1), itemSpacing: 4 }); row.fills = []; strip.appendChild(row); row.layoutSizingHorizontal = 'FILL'; row.layoutSizingVertical = 'FILL';
  const full = r < PICKED;
  const pose = figma.createFrame(); pose.name = full ? 'pose ' + (r + 1) : 'pose (empty)'; pose.cornerRadius = 3; pose.fills = [full ? paint(poseFill[r]) : paint(paper)]; pose.strokes = [paint(ink, full ? 1 : 0.35)]; pose.strokeWeight = 2; pose.strokeAlign = 'INSIDE'; if (!full) { pose.dashPattern = [3, 3]; pose.opacity = 0.6; } row.appendChild(pose); pose.layoutSizingHorizontal = 'FILL'; pose.layoutSizingVertical = 'FILL';
  if (full) { const b = figma.createEllipse(); b.name = 'n'; b.resize(16, 16); b.x = 4; b.y = 3; b.fills = [solid('#ffffff')]; b.strokes = [paint(ink)]; b.strokeWeight = 1.5; pose.appendChild(b); const n = figma.createText(); n.characters = String(r + 1); n.fontName = { family:'Noto Sans TC', style:'Bold' }; n.fontSize = 10; n.lineHeight = { unit:'PIXELS', value: 12 }; n.fills = [paint(ink)]; n.textAlignHorizontal = 'CENTER'; n.resize(16, 12); n.x = 4; n.y = 5; pose.appendChild(n); }
  const photo = figma.createFrame(); photo.name = 'photo slot'; photo.cornerRadius = 3; photo.fills = [solid('#f3eee2')]; photo.strokes = [paint(ink, 0.35)]; photo.strokeWeight = 2; photo.strokeAlign = 'INSIDE'; photo.dashPattern = [2, 2]; if (!full) photo.opacity = 0.6; row.appendChild(photo); photo.layoutSizingHorizontal = 'FILL'; photo.layoutSizingVertical = 'FILL';
  const cam = rect(photo, 'camera', 14, 10, 0, 0, [], 2); cam.strokes = [paint(ink, 0.4)]; cam.strokeWeight = 1.5; cam.constraints = { horizontal:'CENTER', vertical:'CENTER' }; }
// centre the camera outlines once rows have their size
for (const cam of strip.findAll(n => n.name === 'camera')) { const p = cam.parent; cam.x = (p.width - 14) / 2; cam.y = (p.height - 10) / 2; }
const lbl = await text('your strip comes out here', TS.hand, paint(ink, 0.55)); cf.appendChild(lbl); lbl.x = tray.x + 18; lbl.y = tray.y - 30;
// grain
const grain = rect(stage, 'Grain (18% multiply, SVG noise in code)', W, H, 0, 0, [solid('#5a4a42', 0.04)]); grain.blendMode = 'MULTIPLY'; grain.locked = true;
_done({ stage: stage.id, bezel: bezel.id, glass: glass.id, tray: tray.id, tile: [tw, th] });
