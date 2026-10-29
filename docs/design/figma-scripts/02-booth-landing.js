// 02 · Booth landing (desktop 1280×800) per docs/design/booth-landing.md §2.
// Builds "Booth · landing (desktop)" at (0,2400) and a "Booth · half-folded" copy next to it.
// Safe to re-run: removes frames with those names first.
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
for (const n of [...page.children]) if (/^Booth · (landing|half-folded)/.test(n.name)) n.remove();
const V = id => figma.variables.getVariableByIdAsync('VariableID:152:'+id);
const [cream, paper, ink, pink, pinkDeep, blue, blueDeep, yellow, yellowDeep, mint, lilac, peach, metal, metalDark, metalDeep, dDark, thread, floor] = await Promise.all([35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52].map(V));
const paint = (v, o) => { const p = figma.variables.setBoundVariableForPaint({ type:'SOLID', color:{r:0,g:0,b:0} }, 'color', v); return o === undefined ? p : { ...p, opacity: o }; };
const hex = h => { const n = parseInt(h.slice(1), 16); return { r: ((n>>16)&255)/255, g: ((n>>8)&255)/255, b: (n&255)/255 }; };
const vgrad = (stops) => ({ type:'GRADIENT_LINEAR', gradientTransform: [[0,1,0],[-1,0,1]], gradientStops: stops.map(([pos, h, o]) => ({ position: pos, color: { ...hex(h), a: o ?? 1 } })) });
const hgrad = (stops) => ({ type:'GRADIENT_LINEAR', gradientTransform: [[1,0,0],[0,1,0]], gradientStops: stops.map(([pos, h, o]) => ({ position: pos, color: { ...hex(h), a: o ?? 1 } })) });
const shadow = (x, y, blur, a, spread = 0) => ({ type:'DROP_SHADOW', color:{ ...hex('#5a4a42'), a }, offset:{x,y}, radius: blur, spread, visible:true, blendMode:'NORMAL' });
const inner = (x, y, blur, a, white = false) => ({ type:'INNER_SHADOW', color:{ ...(white ? {r:1,g:1,b:1} : hex('#5a4a42')), a }, offset:{x,y}, radius: blur, spread: 0, visible:true, blendMode:'NORMAL' });
await figma.loadFontAsync({ family:'Patrick Hand', style:'Regular' }); await figma.loadFontAsync({ family:'Noto Sans TC', style:'Regular' });
const HAND = { lg:'S:aed34b742db201d8af1741e4b01e91cc5c7d0064,', md:'S:7156dbc4cb15083431c0d95f4737ddfc63b0c715,', sm:'S:f1efe9db56fb5637561ce7041377fd6b51a9f0cf,' };
const text = async (chars, style, fillPaint) => { const t = figma.createText(); t.characters = chars; await t.setTextStyleIdAsync(style); t.fills = [fillPaint]; return t; };
const rect = (parent, name, w, h, x, y, fills, r = 0) => { const n = figma.createRectangle(); n.name = name; n.resize(Math.max(w, 0.01), Math.max(h, 0.01)); n.x = x; n.y = y; n.fills = fills; n.cornerRadius = r; parent.appendChild(n); return n; };
const inst = async id => (await figma.getNodeByIdAsync(id)).createInstance();

const W = 1280, H = 800;
const stage = figma.createFrame(); stage.name = 'Booth · landing (desktop)'; stage.resize(W, H); stage.x = 0; stage.y = 2400; stage.clipsContent = true;
stage.fills = [vgrad([[0,'#f6ecd6'],[0.3,'#fff8e7'],[0.78,'#fff8e7'],[0.781,'#efe3cb'],[1,'#e8dbc1']])];
stage.layoutMode = 'HORIZONTAL'; stage.primaryAxisSizingMode = 'FIXED'; stage.counterAxisSizingMode = 'FIXED'; stage.paddingLeft = 24; stage.paddingRight = 24; stage.paddingTop = 24; stage.paddingBottom = 24; stage.itemSpacing = 0; stage.counterAxisAlignItems = 'MIN';
const DW = 391, MW = 450, LH = H - 48; // columns 1 : 1.15 : 1 of 1232

const locker = async (name, plateNo, extras) => {
  const frame = figma.createFrame(); frame.name = name; frame.resize(DW, LH); frame.fills = [paint(metalDark)]; frame.cornerRadius = 8; frame.clipsContent = false;
  frame.effects = [inner(2, 2, 0, 0.7, true), inner(-2, -2, 0, 0.15), shadow(12, 18, 28, 0.22)];
  stage.appendChild(frame);
  const door = figma.createFrame(); door.name = 'Door'; door.resize(DW - 20, LH - 20); door.x = 10; door.y = 10; door.cornerRadius = 6; door.clipsContent = true;
  door.fills = [{ type:'GRADIENT_LINEAR', gradientTransform: [[0.98,0.17,0],[-0.17,0.98,0.08]], gradientStops: [{ position:0, color:{ ...hex('#fffdf6'), a:1 } }, { position:0.45, color:{ ...hex('#f3eee2'), a:1 } }, { position:1, color:{ ...hex('#ece5d3'), a:1 } }] }];
  door.effects = [inner(3, 3, 0, 0.9, true), inner(-4, -4, 0, 0.12), inner(0, 0, 40, 0.06)];
  frame.appendChild(door);
  const dw = door.width, dh = door.height;
  const hinge = rect(door, 'Hinge', 14, dh * 0.76, dw - 28, dh * 0.12, [hgrad([[0,'#d2c9b6'],[0.4,'#ffffff'],[0.7,'#cfc5b0'],[1,'#b9ae99']])], 7); hinge.effects = [shadow(0, 2, 4, 0.3)];
  for (const t of [0.1, 0.68]) { const k = rect(door, 'Knuckle', 10, hinge.height * 0.22, hinge.x + 2, hinge.y + hinge.height * t, [hgrad([[0,'#c5bba6'],[0.45,'#ffffff'],[1,'#bfb49e']])], 5); k.effects = [shadow(0, 1, 2, 0.3)]; }
  const colF = figma.createAutoLayout('VERTICAL', { name:'Door content', itemSpacing: 16, paddingTop: 20, paddingBottom: 20, paddingLeft: 44, paddingRight: 16 }); colF.fills = []; colF.counterAxisAlignItems = 'CENTER'; colF.resize(dw, dh); colF.primaryAxisSizingMode = 'FIXED'; colF.counterAxisSizingMode = 'FIXED'; door.appendChild(colF); colF.x = 0; colF.y = 0;
  const plate = figma.createAutoLayout('HORIZONTAL', { name:'Number plate' }); plate.primaryAxisAlignItems = 'CENTER'; plate.counterAxisAlignItems = 'CENTER'; plate.resize(92, 38); plate.primaryAxisSizingMode = 'FIXED'; plate.counterAxisSizingMode = 'FIXED'; plate.cornerRadius = 999; plate.fills = [vgrad([[0,'#ffffff'],[0.55,'#e7e0cf'],[1,'#cfc6b1']])]; plate.strokes = [{ type:'SOLID', color: hex('#b8ad97') }]; plate.strokeWeight = 1.5; plate.effects = [shadow(0, 2, 3, 0.3), inner(0, 1, 0, 1, true)]; colF.appendChild(plate);
  const pt = await text(plateNo, HAND.sm, { type:'SOLID', color: hex('#8b7f6c') }); pt.letterSpacing = { unit:'PERCENT', value: 12 }; plate.appendChild(pt);
  const vents = (nm) => { const v = figma.createAutoLayout('VERTICAL', { name: nm, itemSpacing: 9 }); v.fills = []; v.resize(200, 57); v.primaryAxisSizingMode = 'AUTO'; v.counterAxisSizingMode = 'FIXED'; colF.appendChild(v); for (let i = 0; i < 3; i++) { const s = figma.createRectangle(); s.resize(200, 13); s.cornerRadius = 999; s.fills = [vgrad([[0,'#d9d1bd'],[0.45,'#fbf8f0'],[1,'#ffffff']])]; s.effects = [inner(0, 2, 2, 0.25)]; v.appendChild(s); s.layoutSizingHorizontal = 'FILL'; } return v; };
  vents('Vents top');
  await extras(colF, dw, dh);
  const spacer = figma.createFrame(); spacer.name = 'spacer'; spacer.fills = []; spacer.resize(10, 10); colF.appendChild(spacer); spacer.layoutSizingVertical = 'FILL';
  vents('Vents bottom');
  const handle = rect(door, 'Handle', 14, 90, 22, dh * 0.46, [hgrad([[0,'#5a4a42'],[0.4,'#8b7a70'],[1,'#4a3b36']])], 7); handle.effects = [shadow(2, 3, 4, 0.35)];
  const lock = figma.createEllipse(); lock.name = 'Padlock body'; lock.resize(44, 44); lock.x = 8; lock.y = dh * 0.46 + 70; lock.fills = [{ type:'GRADIENT_RADIAL', gradientTransform: [[1,0,0],[0,1,0]], gradientStops: [{ position:0, color:{r:1,g:1,b:1,a:1} }, { position:0.55, color:{ ...hex('#d8d0bd'), a:1 } }, { position:1, color:{ ...hex('#a89d87'), a:1 } }] }]; lock.effects = [shadow(0, 4, 6, 0.35), inner(0, -3, 0, 0.2)]; door.appendChild(lock);
  const shackle = figma.createNodeFromSvg('<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M5 30 V12 a10 10 0 0 1 20 0 V30" fill="none" stroke="#8b7f6c" stroke-width="5"/></svg>'); shackle.name = 'Shackle'; door.appendChild(shackle); shackle.x = lock.x + 7; shackle.y = lock.y - 22;
  const key = figma.createEllipse(); key.name = 'Keyhole'; key.resize(14, 14); key.x = lock.x + 15; key.y = lock.y + 15; key.fills = []; key.strokes = [{ type:'SOLID', color: hex('#8b7f6c') }]; key.strokeWeight = 3; door.appendChild(key);
  return frame;
};
const leftExtras = async (colF, dw) => {
  const m = figma.createEllipse(); m.name = 'Mirror'; const ms = Math.min(dw * 0.52, 176); m.resize(ms, ms); m.fills = [{ type:'GRADIENT_RADIAL', gradientTransform: [[0.9,0,0.35],[0,0.9,0.3]], gradientStops: [{ position:0, color:{r:1,g:1,b:1,a:1} }, { position:0.4, color:{ ...hex('#bcd8ee'), a:1 } }, { position:1, color:{ ...hex('#9fc5e8'), a:1 } }] }]; m.strokes = [{ type:'SOLID', color:{r:1,g:1,b:1} }]; m.strokeWeight = 5; m.strokeAlign = 'OUTSIDE'; m.effects = [{ type:'DROP_SHADOW', color:{ ...hex('#d8d0bd'), a:1 }, offset:{x:0,y:0}, radius:0, spread:7, visible:true, blendMode:'NORMAL' }, shadow(0, 6, 10, 0.25), inner(-6, -8, 14, 0.12)]; colF.appendChild(m);
  const polas = figma.createAutoLayout('VERTICAL', { name:'Polaroids', itemSpacing: 10 }); polas.fills = []; colF.appendChild(polas);
  const ART = ['153:113','153:124','153:133','153:144']; const rot = [-3, 2, 1.5, -2];
  for (let r = 0; r < 2; r++) { const row = figma.createAutoLayout('HORIZONTAL', { name:'Row', itemSpacing: 14 }); row.fills = []; polas.appendChild(row);
    for (let c = 0; c < 2; c++) { const i = r * 2 + c; const p = figma.createFrame(); p.name = 'Polaroid ' + (i + 1); p.resize(72, 86); p.fills = [{ type:'SOLID', color:{r:1,g:1,b:1} }]; p.cornerRadius = 2; p.effects = [shadow(0, 2, 0, 0.1), shadow(0, 6, 10, 0.2)]; p.clipsContent = false; row.appendChild(p);
      const a = await inst(ART[i]); p.appendChild(a); a.resize(62, 62); a.x = 5; a.y = 5;
      if (i === 0 || i === 3) { const tape = rect(p, 'Tape', 36, 14, 18, -8, [paint(blue, 0.75)]); tape.rotation = -3; tape.effects = [shadow(0, 1, 2, 0.2)]; }
      p.rotation = rot[i]; } }
};
const rightExtras = async (colF) => {
  const note = figma.createAutoLayout('VERTICAL', { name:'How-to note' }); note.primaryAxisAlignItems = 'CENTER'; note.counterAxisAlignItems = 'CENTER'; note.resize(152, 190); note.primaryAxisSizingMode = 'FIXED'; note.counterAxisSizingMode = 'FIXED'; note.fills = [paint(yellow)]; note.cornerRadius = 3; note.effects = [shadow(0, 2, 0, 0.08), shadow(0, 8, 16, 0.12)]; note.rotation = -3; note.clipsContent = false; colF.appendChild(note);
  const t = await text('how\nto\nuse', HAND.lg, paint(ink)); t.textAlignHorizontal = 'CENTER'; note.appendChild(t);
  const tape = rect(note, 'Tape', 54, 18, 152 - 18 - 54, -10, [paint(blue, 0.8)]); tape.layoutPositioning = 'ABSOLUTE'; tape.rotation = 28; tape.effects = [shadow(0, 1, 2, 0.2)];
};

const left = await locker('Locker · left', 'No. 04', leftExtras);

// doorway
const dwy = figma.createFrame(); dwy.name = 'Doorway'; dwy.resize(MW - 16, LH); dwy.cornerRadius = 8; dwy.clipsContent = true;
dwy.fills = [{ type:'GRADIENT_RADIAL', gradientTransform: [[0.8,0,0.1],[0,0.5,0.35]], gradientStops: [{ position:0, color:{ ...hex('#6a5750'), a:1 } }, { position:0.7, color:{ ...hex('#4a3b36'), a:1 } }] }];
dwy.effects = [{ type:'INNER_SHADOW', color:{ ...hex('#d9d2c2'), a:1 }, offset:{x:0,y:0}, radius:0, spread:10, visible:true, blendMode:'NORMAL' }, { type:'INNER_SHADOW', color:{r:0,g:0,b:0,a:0.5}, offset:{x:0,y:0}, radius:60, spread:0, visible:true, blendMode:'NORMAL' }, shadow(12, 18, 28, 0.22)];
const dwWrap = figma.createFrame(); dwWrap.name = 'Doorway column'; dwWrap.resize(MW, LH); dwWrap.fills = []; dwWrap.clipsContent = false; stage.appendChild(dwWrap); dwWrap.appendChild(dwy); dwy.x = 8; dwy.y = 0;
const DX = dwy.width, DY = dwy.height;
const peekH = DY * 0.3; const floorH = peekH * 0.36;
const fl = rect(dwy, 'Floor', DX - 20, floorH, 10, DY - 10 - floorH, [paint(floor)]); fl.effects = [inner(0, 6, 10, 0.4)];
for (let x = 48; x < DX - 20; x += 96) rect(dwy, 'Plank', Math.min(48, DX - 20 - x), floorH, 10 + x, fl.y, [{ type:'SOLID', color: hex('#5c4d46') }]);
rect(dwy, 'Floor edge', DX - 20, 3, 10, fl.y, [{ type:'SOLID', color:{r:1,g:1,b:1}, opacity: 0.08 }]);
const hint = figma.createAutoLayout('VERTICAL', { name:'Hint', itemSpacing: 2 }); hint.counterAxisAlignItems = 'CENTER'; hint.fills = []; dwy.appendChild(hint);
const arrow = figma.createNodeFromSvg('<svg width="48" height="24" viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg"><path d="M40 12 H6 M14 4 L6 12 L14 20" fill="none" stroke="#fff8e7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'); arrow.name = 'arrow'; hint.appendChild(arrow);
const ht = await text('Swipe the curtain to enter · 滑開簾子進入', HAND.md, paint(cream)); ht.effects = [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.7}, offset:{x:0,y:1}, radius:2, spread:0, visible:true, blendMode:'NORMAL' }]; hint.appendChild(ht);
hint.x = (DX - hint.width) / 2; hint.y = DY - 10 - peekH * 0.42 - hint.height;
const rod = rect(dwy, 'Rod', DX - 12, 14, 6, 18, [vgrad([[0,'#ffffff'],[0.6,'#d9d2c2'],[1,'#b9ae99']])], 999); rod.effects = [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.35}, offset:{x:0,y:3}, radius:4, spread:0, visible:true, blendMode:'NORMAL' }];
// curtain: hangs 74%, 14px side margins
const CW = DX - 28, CH = DY * 0.74;
const curtain = figma.createFrame(); curtain.name = 'Curtain (closed)'; curtain.resize(CW, CH); curtain.x = 14; curtain.y = 26; curtain.clipsContent = true; curtain.fills = [paint(paper)]; dwy.appendChild(curtain);
curtain.effects = [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.45}, offset:{x:8,y:10}, radius:10, spread:0, visible:true, blendMode:'NORMAL' }];
const stripes = figma.createFrame(); stripes.name = 'Stripes'; stripes.resize(CW, CH); stripes.fills = []; stripes.clipsContent = true; curtain.appendChild(stripes);
for (let x = 0; x < CW; x += 56) { rect(stripes, 'blue', 14, CH, x, 0, [paint(blue)]); rect(stripes, 'pink', 8, CH, x + 28, 0, [paint(pink)]); }
rect(curtain, 'Header band', CW, 26, 0, 0, [paint(pink)]);
const stitch = figma.createLine(); stitch.name = 'Stitch line'; stitch.resize(CW, 0); stitch.x = 0; stitch.y = 25; stitch.strokes = [paint(ink, 0.5)]; stitch.strokeWeight = 2; stitch.dashPattern = [6, 4]; curtain.appendChild(stitch);
const hem = figma.createFrame(); hem.name = 'Hem (scallops)'; hem.resize(CW, 14); hem.x = 0; hem.y = CH - 14; hem.fills = []; hem.clipsContent = true; curtain.appendChild(hem);
rect(hem, 'cut', CW, 14, 0, 0, [{ type:'SOLID', color: hex('#4a3b36') }]);
for (let x = 0; x < CW; x += 28) { const c = figma.createEllipse(); c.resize(28, 28); c.x = x; c.y = -14; c.fills = [paint(paper)]; hem.appendChild(c); }
const art = figma.createAutoLayout('VERTICAL', { name:'Lettering (stitch, brown thread)', itemSpacing: 8 }); art.counterAxisAlignItems = 'CENTER'; art.fills = []; curtain.appendChild(art);
for (const line of ['pose match', 'photobooth']) { const t = figma.createText(); t.characters = line; t.fontName = { family:'Patrick Hand', style:'Regular' }; t.fontSize = 58; t.lineHeight = { unit:'PIXELS', value: 60 }; t.fills = [paint(thread)]; t.strokes = [paint(ink)]; t.strokeWeight = 3; t.strokeAlign = 'OUTSIDE'; t.dashPattern = [3, 2]; t.name = 'stitch/' + line; art.appendChild(t); }
art.x = (CW - art.width) / 2; art.y = CH * 0.16 + (CH * 0.46 - art.height) / 2;
const folds = figma.createFrame(); folds.name = 'Pleats (multiply + sheen)'; folds.resize(CW, CH); folds.fills = []; folds.clipsContent = true; curtain.appendChild(folds);
for (let x = 0; x < CW; x += 36) { const s = figma.createRectangle(); s.resize(18, CH); s.x = x + 12; s.y = 0; s.fills = [{ type:'GRADIENT_LINEAR', gradientTransform: [[1,0,0],[0,1,0]], gradientStops: [{ position:0, color:{ ...hex('#5a4a42'), a:0 } }, { position:0.4, color:{ ...hex('#5a4a42'), a:0.3 } }, { position:0.75, color:{ ...hex('#5a4a42'), a:0.06 } }, { position:1, color:{ ...hex('#5a4a42'), a:0 } }] }]; s.blendMode = 'MULTIPLY'; folds.appendChild(s); const sh = figma.createRectangle(); sh.resize(10, CH); sh.x = x; sh.y = 0; sh.fills = [{ type:'GRADIENT_LINEAR', gradientTransform: [[1,0,0],[0,1,0]], gradientStops: [{ position:0, color:{r:1,g:1,b:1,a:0} }, { position:0.4, color:{r:1,g:1,b:1,a:0.35} }, { position:1, color:{r:1,g:1,b:1,a:0} }] }]; sh.blendMode = 'SCREEN'; folds.appendChild(sh); }
for (let x = 20; x < DX - 20; x += 36) { const r = figma.createEllipse(); r.name = 'Ring'; r.resize(16, 16); r.x = x; r.y = 17; r.fills = []; r.strokes = [hgrad([[0,'#cfc5b0'],[0.5,'#ffffff'],[1,'#b9ae99']])]; r.strokeWeight = 3; dwy.appendChild(r); }

const right = await locker('Locker · right', 'No. 05', rightExtras);
const grain = rect(stage, 'Grain (18% multiply, SVG noise in code)', W, H, 0, 0, [{ type:'SOLID', color: hex('#5a4a42'), opacity: 0.04 }]); grain.blendMode = 'MULTIPLY'; grain.layoutPositioning = 'ABSOLUTE'; grain.x = 0; grain.y = 0; grain.locked = true;

// half-folded copy: curtain at 50% width, children scaled horizontally
const half = stage.clone(); half.name = 'Booth · half-folded (drag in progress)'; half.x = W + 80; half.y = 2400;
const c2 = half.findOne(n => n.name === 'Curtain (closed)'); if (c2) { c2.name = 'Curtain (50% folded)'; for (const ch of c2.children) ch.constraints = { horizontal:'SCALE', vertical:'STRETCH' }; c2.resize(CW * 0.5, CH); }
_done({ stage: stage.id, half: half.id, left: left.id, doorway: dwy.id, curtain: curtain.id, right: right.id });
