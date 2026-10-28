# Implementation Plan: Post Match — Phase A（基本功能）

對應 [docs/SPEC.md](../docs/SPEC.md) v0.1。Phase A 只做功能同測試，唔做視覺。

## Overview

而家 v1 已經行到完整流程（揀人數 → library → 影 4 張 → strip）。Phase A 要做嘅係：加測試基礎、將 strip 輸出改做 IG 4:5、加 Copy Image、加 mirror toggle、補錯誤處理，然後用真機跑一次 checklist 並修正。

## Architecture Decisions

- **純函數同 DOM 分開**：Canvas 喺 jsdom 入面冇得畫，所以將 crop／layout 數學抽做純函數（`coverRect`、`stripLayout`），Vitest 測數學，`drawCover`／`composeStrip` 只係薄薄一層 draw call。
- **Strip 輸出比例獨立一個 module**：`src/strip.ts` 負責 1080×1350 畫布、4 行 3:2 格、置中、留白。之後 Phase C 嘅框只係喺留白位加嘢，唔使改 layout。
- **Mirror 係一個 setting，唔係 camera 狀態**：存喺 `localStorage`（`settings.ts`），Shoot 讀出嚟同時套用喺 `<video>` CSS 同 `drawCover(mirror)`，確保預覽同輸出一致。
- **Copy Image 用 `ClipboardItem` + PNG**：iOS Safari 要求喺 user gesture 入面、而且 blob 要用 Promise 傳入先穩定；strip 保留一份 PNG blob 俾 copy，JPEG 俾 save。
- **唔加 e2e**：camera 喺 CI 開唔到，真機 checklist 寫喺 `docs/DEVICE-CHECKLIST.md` 手動行。

## Task List

### Phase 1: 測試基礎
- [ ] Task 1: 加 Vitest，抽 `coverRect` 純函數並測試
- [ ] Task 2: 用 fake-indexeddb 測 `db.ts`

### Checkpoint: 測試基礎
- [ ] `npm test` 綠、`npm run build` 同 `npm run lint` 零錯誤

### Phase 2: 功能補完
- [ ] Task 3: `strip.ts` — 4:5 1080×1350 layout 純函數 + 測試
- [ ] Task 4: Result 改用 `strip.ts` 輸出，保留 PNG + JPEG 兩份
- [ ] Task 5: Copy Image 掣
- [ ] Task 6: Mirror toggle（settings + Shoot）

### Checkpoint: 功能補完
- [ ] 瀏覽器用 mock camera 走晒流程，輸出係 1080×1350
- [ ] `npm test`、build、lint 綠

### Phase 3: 真機同錯誤處理
- [ ] Task 7: 錯誤狀態 — camera 被拒、clipboard 唔支援、IndexedDB 失敗
- [ ] Task 8: 寫 `docs/DEVICE-CHECKLIST.md`，Bonnie 用 iPhone／iPad／桌面行一次
- [ ] Task 9: 修正真機發現嘅問題（內容未知，試完先開）

### Checkpoint: Phase A 完成
- [ ] SPEC.md「Success Criteria」全部打剔
- [ ] 同 Bonnie review 之後先開 Phase B

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| iOS Safari `ClipboardItem` 要 user gesture + Promise blob，否則 silently fail | High | 用 `new ClipboardItem({'image/png': promise})` 寫法；唔支援就顯示「請用 Save」 |
| iOS Share sheet 唔一定出「儲存影像」 | Med | 用 `File` 而唔係 Blob share；fallback 顯示 long-press 提示 |
| 手機直向 3:2 camera 框太矮，人要企好近 | Med | 已經喺 spec 列為「真機試完先決定」，Task 9 處理 |
| jsdom 冇 canvas | Low | 數學抽純函數測；draw 層靠 mock camera 手動驗 |
| 1080×1350 canvas 加 4 張大相喺舊 iPhone 記憶體 | Low | 影相時已 downscale 到 1600 寬；卡通相 upload 時都 downscale（Task 7 可順手加） |

## Open Questions

- 要唔要同時出 9:16 story 版？（spec Open Q1，而家假設唔使）
- Task 9 嘅內容要等真機試完先知。

---

# Implementation Plan: Post Match — Phase A2（真機試完嘅改動）

對應 [docs/SPEC.md](../docs/SPEC.md) v0.2 A1–A2c。Phase A Task 9（真機修正）併入呢個 phase。

## Overview

五樣嘢：填邊（最細、最急，因為而家會裁走 character）→ library 重整（資料模型變，其他功能都踩住佢）→ crop → 貼上／Share Target → 雙語。雙語放最後，因為前面會新增好多畫面同文字，一次過抽先唔使做兩次。

## Architecture Decisions

- **先改 draw 層，再改資料層**：`drawFit`（contain + blur fill）係純 canvas 邏輯，唔碰資料，可以第一日就上線解決裁相問題。
- **Dexie schema v2**：`images` 加 `personCount`、`characterName`、`sourceId`（由同一張來源切出嚟嘅相共用）；`sets` table 用 Dexie upgrade hook 展開做獨立相後刪除。升級係一次性、不可逆，所以要有測試。
- **Import 係一個 pipeline，唔係一個畫面**：三個入口（檔案／貼上／share target）全部產生 `File[]`，交畀同一個 `Import` 畫面（crop → 填資料 → 入 library）。Share Target 只係多一個入口。
- **Share Target 要自己寫 service worker**：vite-plugin-pwa 由 `generateSW` 轉 `injectManifest`，`sw.ts` 處理 `POST /share-target`，將 FormData 入面嘅檔案存入 Cache API，再 redirect 去 `/?import=share`，app 開咗之後由 cache 攞返。
- **i18n 用 react-i18next**，key 用 `screen.element` 命名（`shoot.retake`），兩個 json 由 ux-copy skill 出，英文先寫，再出台灣繁中。
- **Camera 取景框**（Task 9 嘅發現）：直向手機 3:2 太矮。改做取景框 **4:3**，輸出時再中央裁做 3:2；參考圖同樣以 4:3 顯示（contain + 填邊）。桌面維持 3:2。呢個決定要你 approve（SPEC Ask first：改 camera 比例）。

## Task List

### Phase 1: 填邊 + 取景框（即刻解決真機問題）
- [ ] Task 10: `fitRect` + `drawFit`（contain + blur fill）+ 測試
- [ ] Task 11: 縮圖、參考圖、strip 改用 `drawFit`／CSS contain + blur 背景
- [ ] Task 12: 手機直向取景框改 4:3（輸出仍裁 3:2）

### Checkpoint: 真機再試
- [ ] 1.2:1 貼圖完整顯示；iPhone 取景框見到個人
- [ ] 部署，Bonnie 用 iPhone 確認

### Phase 2: Library 重整
- [ ] Task 13: Dexie v2 schema + 升級 + 測試
- [ ] Task 14: Library grid（篩選人數／角色名、改資料、多選刪除）
- [ ] Task 15: 揀相模式（揀 4 張、調次序 → Shoot）
- [ ] Task 16: 舊 Upload 改做 Import pipeline（檔案入口 + 填人數／角色名，暫時未有 crop）

### Checkpoint: Library
- [ ] 舊資料升級後完整；由 grid 揀 4 張影到 strip
- [ ] 部署

### Phase 3: Crop + 入相
- [ ] Task 17: Crop 畫面（鎖 3:2，「再切一張」）
- [ ] Task 18: 貼上入口（clipboard.read + paste event）
- [ ] Task 19: Share Target（injectManifest sw.ts + manifest share_target + `/?import=share`）

### Checkpoint: iPhone Pinterest 流程
- [ ] Pinterest 複製 → 貼上 → crop → library；Pinterest Share → Post Match → crop → library

### Phase 4: 雙語
- [ ] Task 20: 用 ux-copy 出用詞表 + en.json（你 review）
- [ ] Task 21: 抽晒所有文字入 i18n，接 react-i18next，語言跟系統 + 設定頁可轉
- [ ] Task 22: zh-TW.json（你 review）

### Checkpoint: Phase A2 完成
- [ ] SPEC v0.2 Success Criteria 全剔
- [ ] Review 之後開 Phase B

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dexie 升級寫壞舊資料 | High | 升級前 test 用 v1 schema 入 fixture 再開 v2 驗證；升級一次性，code 保留一個 version |
| iOS Share Target 要由主畫面 PWA 開先出現喺 Share sheet | Med | app 內提示加至主畫面；checklist 寫明 |
| `clipboard.read()` iOS 要 user gesture + 每次問權限 | Med | 用「貼上」掣觸發；失敗提示用 Share 方式 |
| injectManifest 之後 precache 要自己維護 | Low | 用 workbox `precacheAndRoute(self.__WB_MANIFEST)` 照舊 |
| blur fill 喺 1080 寬 canvas 用 `ctx.filter` iOS Safari 支援度 | Med | Safari 17+ 支援 `filter`；fallback 用多次 downscale/upscale 做 blur |
| 4:3 取景框改動影響 `coverRect`/capture | Low | capture 仍輸出 3:2（中央裁），strip 唔使改 |

## Open Questions

- 取景框改 4:3 係咪 OK？（Ask first 項目）
- 用詞表（Task 20 出嚟你揀）
