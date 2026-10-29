# Spec: Post Match Phase C — Decor（frames → stickers → reveal）

版本 v0.1 · 2026-10-28 · 狀態：**等 Bonnie 睇**
上接 [DESIGN-SPEC.md](DESIGN-SPEC.md)（Phase B，token 同 component 已落地）；研究依據 [design/photobooth-flows.md](design/photobooth-flows.md)。

---

## 0. 我假設咗嘅嘢（唔啱即刻話我知）

1. **裝飾喺 strip 合成之後先做**（三個 photobooth 網站都係咁），Shoot 畫面完全唔郁。
2. **順序 frames → stickers → reveal**，每一步可以獨立 ship，做完一步可以停。
3. **冇揀 frame 嗰陣，輸出同而家 byte-for-byte 一樣**（白底、同一個 cell 幾何）。即係 Phase C 唔會偷偷改現有 strip。
4. **揀咗 frame 先會縮細 cell**。而家 strip 幾乎填滿 1080×1350（上下只有 9px、左右 48px），根本冇位畫框。所以 frame 要帶自己嘅 inset，cell 跟住縮；呢個係 `strip.ts` 改動，Boundaries 列明「ask first」，呢份 spec 就係嗰個 ask。
5. **Sticker 第一版只有「㩒一下加、拖去擺、㩒 ✕ 刪」**，冇縮放旋轉（Nashallery 證明已經夠好玩）。
6. **美術素材由我先畫一批簡單 SVG（星、心、閃光、泡泡、絲帶、面珠紅），用五隻粉彩填色**，Chiikawa 風格嘅角色貼紙要你自己提供（版權原因我唔可以畫 Chiikawa）。素材用 manifest 註冊，你之後掉 PNG 入去就用得。
7. **裝飾狀態唔存 DB**，只記住「上次用邊個 frame」喺 settings（同 mirror 一樣用 localStorage）。
8. Tasks 34–36（拖拉排序、拉框 crop、裁圖預覽）繼續放低，Phase C 完成先返嚟。

---

## 1. Objective

俾 Bonnie 喺 strip 合成之後，一分鐘內揀一個框、貼幾個貼紙，然後儲存／複製去 Instagram；成件事要有「貼紙簿」嘅手感，而且唔用 frame 嗰陣一切照舊。

**User stories**

- 影完四格，我想揀一個粉彩框，令 strip 唔係淨係白底。
- 我想㩒幾個貼紙放喺 strip 上面，擺錯可以拖返或者刪走。
- 我想 strip 出現嗰下有少少儀式感，唔係一行「正在合成拼圖…」。
- 我唔想裝飾嗰陣整壞咗相：相格入面嘅內容永遠唔俾框或貼紙遮住（貼紙可以疊喺相上，但係我自己放嘅）。
- 我想之後自己加 Chiikawa 貼紙，唔使改 code。

---

## 2. 研究結論點樣變成設計（摘要）

| 研究發現 | Post Match 做法 |
|---|---|
| 三個站都係 strip 出咗先裝飾 | Result 之後加 **Decorate** 畫面；Shoot 不變 |
| Frame 係最抵嘅 decor，所有站都有 | C1 先做 frame picker（3–5 個） |
| Sticker 㩒一下加 + 拖已經夠（Nashallery） | C2 sticker tray，tap-to-add + drag + ✕ |
| 「沖晒中」假等待係記憶點（MySketchBooth） | C3 reveal：strip 由下滑上 1.2s，reduced-motion 直接出 |
| 倒數秒數選擇、單格重拍（Whee） | **唔喺 Phase C**，放入 Phase D 候選（§13 Q5） |
| Layout picker、36 濾鏡、塗鴉、print、QR、landing | 唔做 |

---

## 3. Flow 改動

```
而家：  Shoot ──▶ Result（合成 → 重拍／複製／儲存）
之後：  Shoot ──▶ Result（reveal → 預覽）──▶ Decorate（框／貼紙）──▶ 儲存／複製
                        │                              ▲
                        └── 「裝飾」secondary 掣 ───────┘   「返回」保留裝飾狀態
```

- **Result**：三個掣變成 重新拍攝（secondary）· **裝飾**（secondary）· 儲存（accent）。複製圖片縮成 header 右邊一個 IconButton（`Copy` icon），桌面先顯示（`canCopyImage()`）。
- **Decorate**：新畫面。中間係 strip（即時重新合成，有 debounce），底部一個 SegmentedControl **框 · 貼紙** 切換 tray 內容，右上 accent 掣 **儲存**；header 返回去 Result（保留已揀嘅框同貼紙，Result 顯示裝飾後嘅版本）。
- 複製／儲存永遠輸出**裝飾後**嘅 strip；冇裝飾 = 同而家一樣。

---

## 4. Decor 系統

### 4.1 Frame

一個 frame = `{ id, name, inset, draw }`：

- `inset: { top, right, bottom, left }`（px，1080×1350 canvas 座標）—— strip 幾何用 `stripLayout({ rows, inset })` 算，cell 等比縮細置中。`inset` 全 0 = 而家嘅幾何（SIDE_PADDING 48、上下自動置中）。
- `draw(ctx, layout)`：喺相格畫完之後畫（框可以探入 gutter，但係 **唔可以覆蓋相格內部**，測試會 sample 相格中心像素）。
- 第一批 3 個：**無框**（預設）、**粉彩邊**（cream 底 + sand 粗邊 + 四角 sticker 式小圓）、**貼紙簿**（白底 + 四邊 pastel 虛線膠紙 + gutter 入面細星）。第 4、5 個等你嘅角色素材。
- Inset 建議：粉彩邊 `{72, 72, 72, 72}`（cell 462×308，strip 高 1268，上下餘 41）；貼紙簿 `{120, 72, 120, 72}`（cell 462×308，上下 band 各 ~80 放膠紙／標題）。數字落實時以 integer cell 為準，寫入 `strip.test.ts`。

### 4.2 Sticker

- Sticker 素材：`{ id, name, src（SVG/PNG）, tint?: 1|2|3|4 }`，manifest 喺 `app/src/decor/stickers.ts`，檔案喺 `app/public/decor/`。
- 第一批 8 個 SVG（我畫）：星、心、閃光、泡泡、絲帶、面珠紅（blush ×2 一對）、對話框、小花。全部單色線條 + 一隻粉彩填色，風格同 Iconoir 線重一致（stroke 2）。
- 放置狀態：`{ stickerId, x, y, scale }`（canvas 座標，第一版 `scale` 固定 0.18 × canvas 寬 ≈ 194px）。
- 互動：tray 㩒一下 → 放喺 strip 中央偏上（唔同貼紙錯開 24px 免疊死）；拖（Pointer Events，手指／滑鼠同一套）；選中嗰個顯示 ring + ✕ IconButton（sm，scrim）；最後加嘅喺最上。最多 12 個。
- 預覽用 DOM 絕對定位（即時、冇 canvas 重繪），儲存／複製先 `composeStrip` 一次畫落 canvas，座標按 canvas/預覽比例換算。

### 4.3 Reveal

- Result 合成完成後：strip 由下方 `translateY(24px)` + opacity 0 → 定位，`duration-base`（250ms）×… 唔夠「沖晒」感；加一個 `--duration-reveal: 1200ms` token，ease `--ease-out`。cream 底上面先出一行「正在沖晒…」（改 `result.composing` 文案）。
- `prefers-reduced-motion`：全域已經 0ms，自然直接出現。
- 唔加任何 library；CSS transition + 一個 `revealed` state。

---

## 5. Token（`--decor-*` namespace，加入 `index.css` `@theme`）

```css
--decor-frame-line: var(--color-sand);
--decor-frame-tape-1..4: var(--color-tint-1..4);     /* 膠紙／角落 */
--decor-sticker-stroke: var(--color-cocoa);
--decor-sticker-fill-1..4: var(--color-tint-1..4);
--decor-blush: var(--color-blush);                   /* 面珠紅只喺 decor 用 */
--duration-reveal: 1200ms;
--spacing-sticker: 48px;                             /* tray tile */
--spacing-tray-decor: 64px;                          /* tray 高（唔計 safe area） */
```

- 守門測試照舊：畫面 code 只准用 token class；canvas 繪圖讀 `getComputedStyle(document.documentElement).getPropertyValue('--decor-…')`，唔寫死 hex。
- 一個 `VITE_DECOR=0` build flag 可以成個 Decorate 入口關掉（Result 唔顯示「裝飾」掣）。

---

## 6. Component（加入 `ui/`，全部跟 DESIGN-SPEC §5 規格）

| Component | 用途 | 尺寸／規則 |
|---|---|---|
| `DecorTray` | 底部橫向 tray，內容係 frame 縮圖或 sticker 格 | 高 `tray-decor` + safe area；tile 48，`gap-2`，`overflow-x-auto`（**記得 `py-1`，Task 33 教訓**）；選中 ring-2 accent-pressed |
| `StickerLayer` | 絕對定位層，渲染已放置貼紙，處理 pointer drag | 貼紙 button 最少 44 命中區（視覺 194/1080 × 預覽寬）；選中顯示 ✕ |
| `FramePreview` | DecorTray 入面一格 frame 縮圖 | 3:2 → 改 4:5 縮圖，`rounded-card ring-1 ring-line` |
| `Reveal` | 包住 Result 張圖嘅動畫 wrapper | 只係 className 切換，冇 JS 動畫 |

Icon（Iconoir）：框 `Frame`，貼紙 `Sparks`，刪貼紙 `Xmark`，裝飾掣 `MagicWand`，複製 `Copy`，儲存 `Download`。

---

## 7. Tech Stack / Commands（不變）

Vite 8 · React 19 · TS 6 · Tailwind 4 · Vitest · iconoir-react。**唔加 dependency**。

```
Dev:   npm run dev --prefix app
Build: npm run build --prefix app
Lint:  npm run lint --prefix app
Test:  npm test --prefix app
```

---

## 8. Project Structure（新增）

```
app/src/decor/
  frames.ts        # Frame 定義（inset + draw）+ manifest
  stickers.ts      # Sticker manifest
  compose.ts       # composeStrip 加 { frame, stickers } 參數嘅 wrapper（strip.ts 本體只加 inset）
app/src/screens/Decorate.tsx
app/src/ui/DecorTray.tsx  StickerLayer.tsx  FramePreview.tsx  Reveal.tsx
app/public/decor/*.svg
app/src/__tests__/decor.test.ts   # layout inset、相格唔被覆蓋、座標換算
docs/design/decor-*.png           # 每個 task 截圖
```

---

## 9. Code Style（一段示範）

```ts
// decor/frames.ts
export interface Frame {
  id: 'none' | 'pastel' | 'stickerbook'
  inset: Inset                      // 全 0 = 原本幾何
  draw?: (ctx: CanvasRenderingContext2D, layout: StripLayout, tokens: DecorTokens) => void
}

// 框只畫喺相格以外：先 clip 走所有 cell，再畫，測試會 sample 每格中心。
export const pastel: Frame = {
  id: 'pastel',
  inset: { top: 72, right: 72, bottom: 72, left: 72 },
  draw(ctx, layout, t) {
    clipOutsideCells(ctx, layout)
    ctx.fillStyle = t.frameLine
    ctx.fillRect(0, 0, layout.width, layout.height)
    …
  },
}
```

規則：`strip.ts` 只加 `inset` 參數（預設 0）；所有 decor 繪圖喺 `decor/`；DOM 預覽同 canvas 輸出共用同一個座標換算函數（`toCanvas(previewRect, point)`），有單元測試。

---

## 10. Testing Strategy

- **單元（Vitest）**：`stripLayout({ rows, inset })` 幾何（integer、置中、inset 0 = 舊值）；每個 frame `draw` 後相格中心像素 = 相格原色（用 OffscreenCanvas 填純色相格）；sticker 座標換算來回誤差 < 1px；manifest 每個 id 唯一、src 存在。
- **守門**：`design-tokens.test.ts` 照掃新檔案。
- **輸出不變**：新增一個 test 用純色方塊合成 `frame: none, stickers: []`，hash 同 Phase B 前一樣（先喺 C1 開頭 snapshot）。
- **手動（browser pane）**：每個 task 截圖落 `docs/design/`；拖貼紙用 `left_click_drag` 驗證；手機寬度 390 同桌面 1024 各一張。
- **真機 checkpoint**：C1 完、C3 完各一次。

---

## 11. Boundaries

- **Always**：`build` + `lint` + `test` 全綠先 commit；一 task 一 commit；frame/sticker 永遠唔遮相格（測試保證）；`frame: none` 輸出不變。
- **Ask first**：`strip.ts` 嘅 `inset` 改動（**呢份 spec approve 即係批**）；加任何 dependency；改 `db.ts`；sticker 縮放／旋轉；改 Shoot 畫面。
- **Never**：改 canvas 尺寸 1080×1350；用 emoji；用真 Chiikawa 版權圖做預設素材；寫死顏色。

---

## 12. Success Criteria

- [ ] Result 多咗「裝飾」掣；`VITE_DECOR=0` 時唔見
- [ ] Decorate 畫面：框 · 貼紙 切換，右上一個 accent 儲存掣，返回保留狀態
- [ ] 3 個 frame 可揀，揀「無框」輸出 hash 同舊版一樣
- [ ] 8 個 sticker 可加、拖、刪；儲存出嚟嘅 JPEG 貼紙位置同預覽一致（肉眼 + 座標測試）
- [ ] Reveal 動畫 1.2s；reduced-motion 下即出
- [ ] 所有新 class 過守門測試；新 component 全部 ≥ 44pt 命中區
- [ ] 截圖：Result、Decorate（框）、Decorate（貼紙）、儲存結果 ×2（有框／無框）
- [ ] Bonnie iPhone 真機：裝飾一次 strip 貼上 IG，話「係貼紙簿嘅感覺」

---

## 13. Open Questions（要 Bonnie 答）

1. **框嘅數量同風格**：第一批 3 個（無框／粉彩邊／貼紙簿）夠唔夠起步？你有冇現成嘅框圖想直接用？
2. **角色貼紙**：你會提供 Chiikawa 風格 PNG（透明底，建議 512×512）定係先用我畫嘅 8 個簡單 SVG？
3. **貼紙可唔可以疊喺相上面**：我假設可以（係你自己放嘅），但框永遠唔可以。OK？
4. **記住上次 frame**：要唔要？（我假設要，用 localStorage）
5. **Phase D 候選**：倒數秒數選擇（關／3／5）、單格重拍、Tasks 34–36。Phase C 完之後揀邊啲？
6. **DESIGN-SPEC §13 舊問題**：Q3 標題字體、Q5 header logo、Q6 桌面兩欄——仍然未答，Phase C 唔靠佢哋，可以之後先。

---

## 14. Phase C 分步（approve 後先寫 plan 同 tasks）

C0 輸出 snapshot 測試 → **C1 frames**（`inset` + 3 框 + Decorate 畫面骨架 + Result「裝飾」掣）→ checkpoint 真機 → **C2 stickers**（manifest + tray + drag + 合成）→ **C3 reveal** → checkpoint 真機 → 截圖收尾。
