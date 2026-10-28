# Post Match — Phase A Tasks

每個 task 做完：`cd app && npm test && npm run build && npm run lint`，然後 commit 一次。

## Phase 1: 測試基礎

- [x] Task 1: 加 Vitest，抽 `coverRect` 純函數並測試
  - Acceptance: `npm test` 可以 run；`coverRect(sw, sh, w, h)` 回傳 `{sx, sy, cw, ch}`；`drawCover` 改用佢；有 test cover 橫圖入直框、直圖入橫框、比例一樣三種 case
  - Verify: `npm test` 綠；mock camera 影相結果同之前一樣
  - Files: `app/package.json`, `app/vite.config.ts`（test config）, `app/src/image.ts`, `app/src/__tests__/image.test.ts`
  - Size: S · Depends: —

- [x] Task 2: 用 fake-indexeddb 測 `db.ts`
  - Acceptance: `saveSet` 存 4 張相 + 1 個 set 並回傳 set；`loadSetImages` 次序同 `imageIds` 一致；`deleteSet` 連相一齊刪
  - Verify: `npm test` 綠
  - Files: `app/src/__tests__/db.test.ts`, `app/package.json`（devDep: fake-indexeddb）
  - Size: S · Depends: Task 1

### Checkpoint: 測試基礎
- [x] `npm test`、`npm run build`、`npm run lint` 全綠
- [x] Commit + push

## Phase 2: 功能補完

- [x] Task 3: `strip.ts` — 4:5 layout 純函數 + 測試
  - Acceptance: `stripLayout({rows: 4})` 回傳畫布 1080×1350 同每格 `{x, y, w, h}`；每格 3:2；strip 水平置中、垂直置中；格與格之間有統一 gap；全部數值整數
  - Verify: test 檢查 1080×1350、8 個格冇重疊、冇出界、左右對稱
  - Files: `app/src/strip.ts`, `app/src/__tests__/strip.test.ts`
  - Size: S · Depends: Task 1

- [x] Task 4: Result 改用 `strip.ts` 輸出
  - Acceptance: `composeStrip` 用 `stripLayout` 畫；回傳 `{png: Blob, jpeg: Blob}`；Result 預覽顯示 4:5 整張圖；Save 用 JPEG
  - Verify: mock camera 走流程，download 嘅圖係 1080×1350
  - Files: `app/src/strip.ts`, `app/src/screens/Result.tsx`
  - Size: S · Depends: Task 3

- [x] Task 5: Copy Image 掣
  - Acceptance: Result 有「Copy Image」；用 `ClipboardItem({'image/png': Promise<Blob>})`；成功顯示「已複製」toast 2 秒；`navigator.clipboard.write` 唔存在就 disable 並顯示原因
  - Verify: 桌面 Chrome copy 後貼入任何 app 係張 strip；unit test 用 mock clipboard 檢查有 call
  - Files: `app/src/screens/Result.tsx`, `app/src/clipboard.ts`, `app/src/__tests__/clipboard.test.ts`
  - Size: S · Depends: Task 4

- [x] Task 6: Mirror toggle
  - Acceptance: `settings.ts` 有 `getMirror()/setMirror()` 存 localStorage，預設 `true`；Shoot header 有「鏡像」toggle；開關即時影響 `<video>` 翻轉同 `drawCover(mirror)`；轉後鏡時 toggle 仍然可用但預設唔鏡像
  - Verify: mock camera 下 toggle off，影出嚟「MOCK CAM」字正向；toggle on 字反向；reload 後記得設定
  - Files: `app/src/settings.ts`, `app/src/screens/Shoot.tsx`, `app/src/__tests__/settings.test.ts`
  - Size: S · Depends: —

### Checkpoint: 功能補完
- [x] 瀏覽器 mock camera 走晒流程，輸出 1080×1350（copy 喺預覽窗被 permission 擋住，留待 Task 8 真機／桌面驗證）
- [x] `npm test`、build、lint 全綠
- [x] Commit + push，Vercel 自動部署成功
- 期間修咗兩個 bug：Upload 揀相後 FileList 被清空（state 永遠 0 張）；Shoot 每次 render 新 array 傳入 useObjectUrls 造成無限 re-render

## Phase 3: 真機同錯誤處理

- [x] Task 7: 錯誤狀態
  - Acceptance: camera 被拒 → 顯示「去設定開返 camera 權限」同「重試」掣；`NotFoundError` → 「搵唔到 camera」；clipboard 唔支援 → Copy 掣 disable + 提示；`saveSet` 失敗（quota）→ alert 而唔係 silent；upload 嘅卡通相 downscale 到最長邊 1600
  - Verify: mock `getUserMedia` reject 唔同 error name 檢查文字；upload 一張 4000px 相之後 IndexedDB 入面 blob 細咗
  - Files: `app/src/screens/Shoot.tsx`, `app/src/screens/Upload.tsx`, `app/src/screens/Result.tsx`, `app/src/image.ts`
  - Size: M · Depends: Task 5, 6

- [x] Task 8: 真機 checklist
  - Acceptance: `docs/DEVICE-CHECKLIST.md` 列出 iPhone Safari／iPad／桌面 Chrome 每項要試嘅嘢（前鏡、轉鏡、倒數、mirror、重影、save 入相簿、copy 貼入 IG、加到主畫面、離線開啟）；**同時重新檢視 SPEC.md「我假設咗嘅嘢」1–5 同「Open Questions」1–3，每條寫返真機試完嘅決定**；Bonnie 行完每項打剔或寫問題
  - Verify: checklist 有 Bonnie 填返嘅結果
  - Files: `docs/DEVICE-CHECKLIST.md`
  - Size: XS · Depends: Task 7

- [ ] Task 9: 修正真機問題
  - Acceptance: 等 Task 8 結果先拆成細 task
  - Verify: 重行 checklist 相關項目
  - Files: TBD
  - Size: TBD · Depends: Task 8

### Checkpoint: Phase A 完成
- [ ] SPEC.md Success Criteria 全部打剔
- [ ] Review 之後開 Phase B（design）嘅 spec

---

# Post Match — Phase A2 Tasks

Task 9（真機修正）併入 Task 10–12。每個 task 做完：`cd app && npm test && npm run build && npm run lint`，commit 一次。

## Phase 1: 填邊 + 取景框

- [x] Task 10: `fitRect` + `drawFit` + 測試
  - Acceptance: `fitRect(sw, sh, w, h)` 回傳 contain 之後嘅目標矩形 `{x, y, w, h}`（置中）；`drawFit(ctx, src, x, y, w, h)` 先畫放大 + blur + 調暗嘅背景（cover），再畫 contain 嘅前景；3:2 相唔會出現邊
  - Verify: fitRect 測 橫／直／啱比例 三 case；mock 一張 1.2:1 圖，strip 輸出肉眼見到完整 + 模糊邊
  - Files: `app/src/image.ts`, `app/src/__tests__/image.test.ts`
  - Size: S · Depends: —

- [x] Task 11: 三個地方改用填邊
  - Acceptance: Library 縮圖、Shoot 參考圖用 CSS（`object-contain` + 同一張圖做 blur 背景層）；`composeStrip` 用 `drawFit` 畫卡通格；真人格維持 cover（camera 本身係 3:2 裁好）
  - Verify: mock camera 走流程，用 1.2:1 貼圖，三個地方都完整
  - Files: `app/src/screens/Home.tsx`, `app/src/screens/Shoot.tsx`, `app/src/strip.ts`, `app/src/ui.tsx`（新 `FitImage` component）
  - Size: S · Depends: Task 10

- [x] Task 12: 手機直向取景框 4:3
  - Acceptance: viewport 直向且闊度 < 768 時，camera 框同參考圖框都係 4:3；capture 仍中央裁出 3:2；桌面／橫向維持 3:2；有一個 `VIEWFINDER_RATIO` 單一來源
  - Verify: 瀏覽器 mobile viewport 見到 4:3 框；輸出 strip 仍 1080×1350 格 3:2
  - Files: `app/src/screens/Shoot.tsx`, `app/src/image.ts`
  - Size: S · Depends: Task 10
  - **Ask first**: 比例改動，等 Bonnie approve plan 先做

### Checkpoint: 真機再試
- [x] 部署；Bonnie iPhone 確認 貼圖完整 + 取景框見到人
- [x] 同時答返 checklist D：Copy Image、儲存相簿 兩樣（iPhone 兩樣都 ✅）

## Phase 2: Library 重整

- [x] Task 13: Dexie v2 schema + 升級 + 測試
  - Acceptance: `images` 加 `personCount: 1|2`、`characterName: string`、`sourceId?: string`、index `[personCount+characterName]`；`sets` 喺 v2 upgrade 展開（每張相攞 set 嘅 personCount，characterName = set.name）後刪除 table；`listCharacterNames()` 回傳去重名單
  - Verify: test 用 Dexie v1 定義入 2 個 set，關閉，開 v2，8 張相帶正確欄位，`sets` 唔存在
  - Files: `app/src/db.ts`, `app/src/__tests__/db.test.ts`
  - Size: M · Depends: —

- [x] Task 14: Library grid
  - Acceptance: Home 變成 Library：頂部 人數 toggle + 角色名 chips（由 `listCharacterNames`）；grid 顯示篩選結果；長按／「選取」進入多選，可刪除；點一張可以改人數／角色名；篩選記住上次（localStorage）
  - Verify: 入 6 張相 2 個角色名，篩選正確；刪 2 張後 count 啱；reload 篩選仍在
  - Files: `app/src/screens/Library.tsx`（取代 Home）, `app/src/App.tsx`, `app/src/settings.ts`, `app/src/ui.tsx`
  - Size: M · Depends: Task 13

- [x] Task 15: 揀相模式
  - Acceptance: Library 有「開始拍攝」→ 進入揀相模式；點相出現 1–4 序號，再點取消；底部顯示已揀 4 格可拖／調次序；揀夠 4 張「開始」先可用；交 `Blob[]` 畀 Shoot
  - Verify: 揀 4 張次序 3-1-4-2，Shoot 第 1 張係第 3 張相
  - Files: `app/src/screens/Library.tsx`, `app/src/App.tsx`
  - Size: M · Depends: Task 14

- [x] Task 16: Import pipeline（檔案入口）
  - Acceptance: `Import` 畫面接收 `File[]`：逐張顯示（暫時無 crop）→ 填人數 + 角色名（自動完成）一次套用全部 → 入 library → 返 Library grid；舊 Upload 畫面刪除；相仍 downscale 1600
  - Verify: 揀 3 張檔案，填 "Chiikawa"，grid 見到 3 張帶該名
  - Files: `app/src/screens/Import.tsx`, `app/src/App.tsx`, 刪 `app/src/screens/Upload.tsx`
  - Size: M · Depends: Task 14

### Checkpoint: Library
- [x] 舊資料升級完整（瀏覽器內 v1 真資料 8 張升級成功，sets 表消失）；grid → 揀 4 張 → strip 1080×1350
- [x] 部署
- [ ] Bonnie 確認（iPhone 舊相仲喺度、篩選、揀 4 張、加入圖片）

## Phase 3: Crop + 入相

- [x] Task 17: Crop 畫面
  - Acceptance: Import 每張相先入 crop：拖動／雙指縮放，框鎖 3:2；「跳過」= 唔裁（之後填邊）；「再切一張」將當前裁出嚟加入隊列並留喺同一來源相；裁出嚟嘅相帶同一 `sourceId`
  - Verify: 一張 4 格 strip 切 4 次 → library 4 張獨立相
  - Files: `app/src/screens/Crop.tsx`, `app/src/screens/Import.tsx`, `app/package.json`（react-easy-crop，**Ask first**）
  - Size: M · Depends: Task 16

- [x] Task 18: 貼上入口
  - Acceptance: Library 有「貼上」掣 → `navigator.clipboard.read()` 攞 image/* → 入 Import；桌面 `paste` event 同樣；唔支援／拒絕 → 提示用 Share
  - Verify: 桌面 Chrome 複製一張圖 → 貼上 → Import 出現；unit test mock clipboard.read
  - Files: `app/src/clipboard.ts`, `app/src/__tests__/clipboard.test.ts`, `app/src/screens/Library.tsx`
  - Size: S · Depends: Task 16

- [x] Task 19: Share Target
  - Acceptance: manifest `share_target`（POST, multipart, `files` image/*）；`sw.ts`（injectManifest）接 POST → 存 Cache → redirect `/?import=share`；app 啟動見到 param 由 cache 攞檔案入 Import 並清除；precache 照舊
  - Verify: 桌面 Chrome 安裝 PWA 後由其他 app share 圖片；iPhone 由 Pinterest share（Bonnie）
  - Files: `app/vite.config.ts`, `app/src/sw.ts`, `app/src/shareTarget.ts`, `app/src/App.tsx`, `app/tsconfig.app.json`
  - Size: M · Depends: Task 16

### Checkpoint: iPhone Pinterest 流程
- [x] 桌面驗證：crop 多切、paste event、SW 接 POST → cache → `?import=share` → Crop（vite preview + 真 service worker）
- [x] 部署
- [ ] Bonnie：Pinterest 複製→貼上 同 Share→Post Match 兩條路都入到 library

## Phase 4: 雙語

- [x] Task 20: 用詞表 + en.json
  - Acceptance: 用 `design:ux-copy` 出用詞表（Library／Strip／Shoot／Character name／Fill edges 等）同所有 key 嘅英文；Bonnie review
  - Verify: Bonnie approve
  - Files: `docs/COPY.md`, `app/src/locales/en.json`
  - Size: S · Depends: Task 17–19 完成（畫面齊）

- [x] Task 21: 接 i18n
  - Acceptance: react-i18next（**Ask first** dependency）；所有畫面文字用 `t()`；語言跟 `navigator.language`（zh* → zh-TW，否則 en）；設定頁可以轉並記住；`<html lang>` 跟住變
  - Verify: grep `src` 冇中文字串；轉語言所有畫面即時變
  - Files: `app/src/i18n.ts`, `app/src/screens/Settings.tsx`, 全部 screens
  - Size: L（多 file 但機械式）· Depends: Task 20

- [x] Task 22: zh-TW.json
  - Acceptance: 台灣繁體書面語，跟用詞表；Bonnie review
  - Verify: Bonnie approve；全畫面 zh-TW 截圖
  - Files: `app/src/locales/zh-TW.json`
  - Size: S · Depends: Task 21

### Checkpoint: Phase A2 完成
- [x] 桌面：EN ↔ 繁中 切換、記住選擇、`<html lang>` 跟住變；兩個 locale key 一致；全部畫面冇硬寫文字
- [x] 部署
- [x] Bonnie review 繁中文案（docs/COPY.md 用詞表 + app 內逐個畫面）
- [x] SPEC v0.2 Success Criteria 全剔
- [x] Review 後開 Phase B（design）spec

---

# Post Match — Phase B Tasks（Design）

對應 [tasks/plan.md](plan.md) Phase B、[docs/DESIGN-SPEC.md](../docs/DESIGN-SPEC.md) v0.2。一個 task 一個 commit。

## Phase 1: Token

- [x] Task 23: index.css 新 token
  - Acceptance: `@theme` 有 DESIGN-SPEC §4.1–4.7 全部 token；原色層係 Chiikawa 色板；語意層用 color-mix；字體 fallback `PingFang TC, Noto Sans TC`；舊 `berry` 刪走（暫時 alias 去 accent 等 B3 換完先刪）；app 開到、build 綠
  - Verify: browser pane 將 Chiikawa 圖同 Library 併排截圖入 `docs/design/palette.png`，Bonnie 睇一眼
  - Files: `app/src/index.css`, `docs/design/palette.png`
  - Size: S · Depends: —

- [x] Task 24: design-tokens 守門測試
  - Acceptance: `__tests__/design-tokens.test.ts` 掃 `src/**/*.tsx`，禁用：spacing `0.5 1.5 2.5 3 3.5 5 7 9 10 11 14`、`rounded-(lg|xl|2xl|3xl)`、`(bg|text|ring|border)-(ink|black|white)(/\d+)?`、`text-(xs|sm|base|lg|xl|2xl)`、任意值 `[...]`（`env(` 白名單）；fail message 列出 file:line；暫時 `test.todo`／skip 直至 Task 30
  - Verify: 跑一次見到完整違規清單（而家應該 ~60 處）
  - Files: `app/src/__tests__/design-tokens.test.ts`
  - Size: S · Depends: Task 23

## Phase 2: Component（純搬動，零視覺改動）

- [x] Task 25: 抽 ui/ 第一批
  - Acceptance: `ui/Button.tsx` `IconButton.tsx` `Header.tsx` `FitImage.tsx` `SegmentedControl.tsx` `Chip.tsx` `Badge.tsx` `Toast.tsx` + `ui/index.ts`；`ui.tsx` 刪走；PersonToggle 變 SegmentedControl 嘅一個用法；screens 改 import；畫面樣貌不變
  - Verify: build + lint + test 綠；browser pane 走一次流程
  - Files: `app/src/ui/*`, `app/src/screens/*.tsx`
  - Size: M · Depends: Task 23

- [x] Task 26: 抽 ui/ 第二批
  - Acceptance: `Tile.tsx` `Tray.tsx` `Sheet.tsx` `TextField.tsx` `EmptyState.tsx` `Scrim.tsx` `Countdown.tsx` `Shutter.tsx`；Library.tsx < 200 行；畫面樣貌不變
  - Verify: 同上
  - Files: `app/src/ui/*`, `app/src/screens/Library.tsx`, `Shoot.tsx`
  - Size: M · Depends: Task 25

## Phase 3: 畫面套用

- [x] Task 27: Library
  - Acceptance: 全部 class 用語意 token；spacing 喺 grid；chip／tile／sheet／tray／空狀態跟 DESIGN-SPEC §3 §5；主要動作粉紅 pill 配深字；單人／雙人 chip 用 tint-1／tint-2
  - Verify: `docs/design/library-before.png` / `-after.png`（390 寬）；守門測試 Library 零違規
  - Files: `app/src/screens/Library.tsx`, `app/src/ui/*`
  - Size: M · Depends: Task 26

- [x] Task 28: Import + Crop
  - Acceptance: 同上；Crop 嘅三個掣層級清楚（一個 accent、兩個 secondary）
  - Verify: before／after 截圖；守門零違規
  - Files: `app/src/screens/Import.tsx`, `Crop.tsx`
  - Size: S · Depends: Task 27

- [x] Task 29: Shoot + Result
  - Acceptance: 取景畫面用 `on-dark`／`scrim`；快門 72；倒數 display 級；Result 標題 display 級、儲存係唯一 accent 掣
  - Verify: before／after 截圖（mock camera）；strip 輸出測試不變
  - Files: `app/src/screens/Shoot.tsx`, `Result.tsx`
  - Size: M · Depends: Task 28

- [x] Task 30: 收尾（截圖未補，見 DESIGN-SPEC §12）
  - Acceptance: 守門測試由 skip 轉正式、全綠；browser pane 掃所有 button ≥ 44×44；`prefers-reduced-motion` 動畫 0ms；5 個畫面 before／after 齊；DESIGN-SPEC §12 可剔嘅全剔
  - Verify: `npm test` 全綠；故意加 `px-3` 會 fail
  - Files: `app/src/__tests__/design-tokens.test.ts`, `app/src/index.css`, `docs/design/*`, `docs/DESIGN-SPEC.md`
  - Size: S · Depends: Task 29

### Checkpoint: Phase B 基礎
- [ ] 部署
- [ ] Bonnie iPhone 過 5 個畫面；色板同 Chiikawa 圖對照
- [ ] 答 DESIGN-SPEC §13 Q3–7，開 Phase 4

## Phase 4: Decor（等 checkpoint 答完先細寫）

- [ ] Task 31: decor token + 第一個 element
- [ ] Task 32: 第二、三個 element
