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

---

# Implementation Plan: Post Match — Phase B（Design）

對應 [docs/DESIGN-SPEC.md](../docs/DESIGN-SPEC.md) v0.2。Phase B 唔改功能、唔改 strip 輸出。

## Overview

由底向上：先定 token（CSS 一個檔），再抽 component（`ui/`），再逐個畫面套用，最後加守門測試，真機 checkpoint。之後先開 decor（圖案／element），因為 decor 要有穩定嘅 token 同 component 先有嘢可以掛。

## Architecture Decisions

- **Token 只放 `@theme`**：Tailwind 4 由 `--color-*`、`--spacing-*`、`--radius-*`、`--text-*` 自動生成 class，唔寫 tailwind.config。語意色用 `color-mix()` 由原色推出，改一個原色全 app 跟住變。
- **語意層同原色層分開**：component 只 import 語意 class（`bg-accent`、`text-fg-muted`）；原色（`pink`、`sky`）只喺 `index.css` 同 decor 用。
- **Component 先抽後改**：B2 將現有 JSX 原封搬去 `ui/`，B3 先改外觀。咁 B2 嘅 diff 係純搬動，容易 review；B3 嘅 diff 先係視覺改動。
- **守門測試用 regex 掃 source**：唔裝 Tailwind lint plugin（唔加 dependency），一個 Vitest 檔掃 `src/**/*.tsx` 禁用 class 即可。
- **截圖做視覺 regression**：browser pane 390 寬，每個畫面 before／after PNG 入 `docs/design/`，人眼對照。唔做 pixel diff。
- **Decor 延後到 B5**：等 B1–B4 真機 OK 先定 `--decor-*`，避免 token 未穩定就加嘢。

## Task List

### Phase 1: Token
- [ ] Task 23: `index.css` 新 token（色板、spacing、字級、圓角、尺寸、動效、陰影）+ 字體 fallback 改 TC
- [ ] Task 24: `design-tokens.test.ts` 守門測試（先 fail，列出所有違規）

### Phase 2: Component
- [ ] Task 25: 抽 `ui/`（Button、IconButton、Header、FitImage、SegmentedControl、Chip、Badge、Toast）— 純搬動
- [ ] Task 26: 抽 `ui/`（Tile、Tray、Sheet、TextField、EmptyState、Scrim、Countdown、Shutter）— 純搬動

### Phase 3: 畫面套用
- [ ] Task 27: Library 套 token + component（含 EditSheet、PickTray、空狀態）
- [ ] Task 28: Import + Crop 套 token + component
- [ ] Task 29: Shoot + Result 套 token + component
- [ ] Task 30: 守門測試轉綠、44pt 掃、reduced-motion、before／after 截圖

### Checkpoint: Phase B 基礎（真機）
- [ ] Bonnie iPhone 過 5 個畫面；色板同 Chiikawa 圖併排對照
- [ ] 28 舊測試 + 新測試綠；strip 輸出不變

### Phase 4: Decor
- [ ] Task 31: `--decor-*` token + 第一個 element（Bonnie 揀：空狀態插圖／完成頁慶祝／圖庫紋理）
- [ ] Task 32: 第二、三個 element（視乎 Bonnie reference）

### Checkpoint: Phase B 完成（真機）

## Risks and Mitigations

- **目測色值同圖有偏差** → Task 23 喺 browser pane 將圖同 app 併排截圖，Bonnie 確認先入 commit。
- **粉彩底字對比唔夠** → 全部粉彩配 cocoa 深字，Task 30 用 browser pane 計 contrast，< 4.5 即改。
- **搬 component 時改咗行為** → B2 純搬動、零視覺改動，跑現有流程一次；B3 先改樣。
- **守門測試太嚴阻住開發** → 禁用表只限 spec §4.1／§9 列明嘅，safe-area `env()` 任意值白名單。
- **Library.tsx 387 行拆唔乾淨** → 目標 < 200 行；拆唔到就留低 EditSheet 喺 screens/，唔強求。

## Open Questions

- 字體（system vs 標題 web font）、decor 想要邊三樣、header 要唔要 logo、平板兩欄——見 DESIGN-SPEC §13 Q3–7，B5 之前要答。

---

# Implementation Plan: Post Match — Phase C.0（Booth landing + Library 入 booth）

對應 [docs/design/booth-landing.md](../docs/design/booth-landing.md) §1–§3（Bonnie 已批）；§3b（Shoot／Result／Decorate 入 booth 框）未批，只預留位。Mock 原碼：[docs/design/mocks/booth-web.html](../docs/design/mocks/booth-web.html) v8。

## Overview

Launch 先見 Booth（兩隻 cream locker 門 + 中間掛條紋簾嘅門口）→ 拖簾向左摺（accordion）→ Library 喺 booth 入面（bezel 玻璃、兩支管燈、櫃台、斜 tray 顯示 4×2 strip 預覽）→ 之後 Pick／Shoot／Result 唔變。Desktop 先；<760px 跟 mock 收成一欄。唔加 dependency。

## Architecture Decisions

- **Booth 視覺用一個 scoped CSS 檔（`booth.css`），唔用 Tailwind utility。** 門框 10px、鉸鏈 14px、摺 36px、perspective 呢啲全部唔喺 8pt scale 上，硬塞 utility 會同 `design-tokens.test.ts` 打交。CSS 入面只准用 `var(--color-decor-*)`、`var(--spacing-*)`，另加一個測試掃 `booth.css` 冇 hex 色（同守門測試一樣精神）。TSX 只有 class name。
- **decor token 入 `@theme`**：`--color-decor-cream/paper/ink/pink/pink-deep/blue/blue-deep/yellow/mint/lilac/peach/metal/metal-dark/dark`（booth-landing.md 色表），加 `--duration-curtain: 420ms`、`--ease-curtain: cubic-bezier(.2,.8,.2,1)`。守門測試嘅「raw colour」regex 唔會撞 `decor-*`（已核對）。
- **Booth 係 App 一個 screen，唔係 Library 嘅一部分。** `App.tsx` 加 `{ name: 'booth' }`，launch 預設去 booth；`entered` state 記住今次 launch 入過；Library header 多個 Back → booth；share-target launch 直接去 crop，跳過 booth。`VITE_DECOR=0` 時成個 booth 關掉，直落 Library（同 DECOR-SPEC 同一個 flag）。
- **App 外層 `max-w-xl` 改為 per-screen。** Booth 同 Library-in-booth 要 full viewport；Crop／Import／Shoot／Result 保持而家 576px 置中。
- **Library 內容零改動，只換殼。** `Library.tsx` 抽一個 `LibraryBody`（header、chips、grid、bottom bar）出嚟，`<BoothInterior>` 喺 ≥760px 時包住佢（bezel／管燈／櫃台／tray），<760px 直接 render `LibraryBody`（即今日 phone 版）。Tray 嘅 4×2 預覽讀 Library 嘅 `selected`；管燈 `lit` = 揀滿 4。
- **簾嘅拖拉係一個純 reducer + 一個 hook。** `curtainReducer(state, event)` 算 progress、snap／spring 決定（Vitest 測），`useCurtainDrag()` 用 Pointer Events 接落 DOM，只寫 `transform: scaleX()`。`prefers-reduced-motion` 時冇 transition。
- **手寫字體**：mock 用 Google Fonts 嘅 Patrick Hand（OFL）。PWA 要離線，所以 **self-host woff2 喺 `app/public/fonts/`**（加 asset，唔係 npm dependency，但係都當「ask first」：見 Open Questions）。未批之前 fallback `ui-rounded, "Chalkboard SE", cursive`。
- **素材全部 placeholder**：polaroid 用 mock 嘅 4 個 SVG 面、簾字用 SVG text + stitch pattern、紋理用 SVG `feTurbulence`。Bonnie 之後供 PNG（booth-landing.md §4）直接換檔，唔使改 code。

## Task List

### Phase 1: 殼
- [ ] Task 38: decor token + booth flag + routing（Booth 空殼、Library Back、per-screen 寬度）
- [ ] Task 39: Locker 門（框、門、鉸鏈、把手鎖、號碼牌、通風口、鏡、polaroid、how-to 便條 + Sheet）
- [ ] Task 40: 門口 + 簾（桿、環、條紋布、頭帶、波浪底、摺影、繡字、提示）

### Checkpoint: 靜態 Booth
- [ ] 1280 寬截圖同 mock v8 並排；`npm test` 全綠

### Phase 2: 動
- [ ] Task 41: 簾拖拉（reducer + hook、snap／spring／squeeze、Library 淡入、Back 時簾返）
- [ ] Task 42: Library 入 booth（bezel、管燈、櫃台、斜 tray 4×2 預覽、<760 fallback）
- [ ] Task 43: 收尾（字體決定落實、截圖 ×4、DESIGN-SPEC §4.8 連結、todo）

### Checkpoint: Bonnie desktop 真 Chrome
- [ ] 簾「摺布」唔係「推板」；Back 簾返；phone 寬度 Library 同今日一樣
- [ ] 批唔批 §3b（Shoot／Result／Decorate 入 booth 框）→ 開 Phase C.1

## Risks and Mitigations

- **CSS 體積同複雜度**：mock 嘅 CSS 約 200 行，搬入 app 會變 booth.css ~250 行。風險係之後冇人敢郁。緩解：每個部件一個 class 前綴（`.booth-door`、`.booth-curtain`），檔頭寫清楚對應 mock 邊段。
- **Pointer Events 喺 iPad／觸控板**：`touch-action: pan-y` 要落喺門口，唔係簾，否則垂直捲動同拖簾打架。測試：pane 用 `left_click_drag`，iPad 真機 checkpoint。
- **守門測試誤殺**：booth.css 唔喺 `*.tsx` glob 入面，TSX 只有 class name，應該安全。Task 38 先加 booth.css 嘅 hex 掃描測試，之後每個 task 都靠佢。
- **Share target 同 booth 搶路**：`launchedFromShare()` 已經喺 App 第一個 effect，加 `entered=true` 就得；加一個 App 測試。
- **Library 抽 `LibraryBody` 會郁到 Task 33 啱啱改完嘅嘢**：純搬動，零視覺改動，用 pane 截圖 before／after 對。

## Open Questions

1. **Patrick Hand self-host**（加 ~30KB woff2 到 `public/fonts/`，OFL）——批唔批？唔批就用系統 cursive，簾字會差啲。
2. **Booth 每次 launch 都出**（brief 寫「once per launch」）定係 session 入面入過就唔再出？我假設前者。
3. **§3b** 睇完 mock v8 之後先答；呢個 plan 唔包。
