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
