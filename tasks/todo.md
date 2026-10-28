# Post Match — Phase A Tasks

每個 task 做完：`cd app && npm test && npm run build && npm run lint`，然後 commit 一次。

## Phase 1: 測試基礎

- [x] Task 1: 加 Vitest，抽 `coverRect` 純函數並測試
  - Acceptance: `npm test` 可以 run；`coverRect(sw, sh, w, h)` 回傳 `{sx, sy, cw, ch}`；`drawCover` 改用佢；有 test cover 橫圖入直框、直圖入橫框、比例一樣三種 case
  - Verify: `npm test` 綠；mock camera 影相結果同之前一樣
  - Files: `app/package.json`, `app/vite.config.ts`（test config）, `app/src/image.ts`, `app/src/__tests__/image.test.ts`
  - Size: S · Depends: —

- [ ] Task 2: 用 fake-indexeddb 測 `db.ts`
  - Acceptance: `saveSet` 存 4 張相 + 1 個 set 並回傳 set；`loadSetImages` 次序同 `imageIds` 一致；`deleteSet` 連相一齊刪
  - Verify: `npm test` 綠
  - Files: `app/src/__tests__/db.test.ts`, `app/package.json`（devDep: fake-indexeddb）
  - Size: S · Depends: Task 1

### Checkpoint: 測試基礎
- [ ] `npm test`、`npm run build`、`npm run lint` 全綠
- [ ] Commit + push

## Phase 2: 功能補完

- [ ] Task 3: `strip.ts` — 4:5 layout 純函數 + 測試
  - Acceptance: `stripLayout({rows: 4})` 回傳畫布 1080×1350 同每格 `{x, y, w, h}`；每格 3:2；strip 水平置中、垂直置中；格與格之間有統一 gap；全部數值整數
  - Verify: test 檢查 1080×1350、8 個格冇重疊、冇出界、左右對稱
  - Files: `app/src/strip.ts`, `app/src/__tests__/strip.test.ts`
  - Size: S · Depends: Task 1

- [ ] Task 4: Result 改用 `strip.ts` 輸出
  - Acceptance: `composeStrip` 用 `stripLayout` 畫；回傳 `{png: Blob, jpeg: Blob}`；Result 預覽顯示 4:5 整張圖；Save 用 JPEG
  - Verify: mock camera 走流程，download 嘅圖係 1080×1350
  - Files: `app/src/strip.ts`, `app/src/screens/Result.tsx`
  - Size: S · Depends: Task 3

- [ ] Task 5: Copy Image 掣
  - Acceptance: Result 有「Copy Image」；用 `ClipboardItem({'image/png': Promise<Blob>})`；成功顯示「已複製」toast 2 秒；`navigator.clipboard.write` 唔存在就 disable 並顯示原因
  - Verify: 桌面 Chrome copy 後貼入任何 app 係張 strip；unit test 用 mock clipboard 檢查有 call
  - Files: `app/src/screens/Result.tsx`, `app/src/clipboard.ts`, `app/src/__tests__/clipboard.test.ts`
  - Size: S · Depends: Task 4

- [ ] Task 6: Mirror toggle
  - Acceptance: `settings.ts` 有 `getMirror()/setMirror()` 存 localStorage，預設 `true`；Shoot header 有「鏡像」toggle；開關即時影響 `<video>` 翻轉同 `drawCover(mirror)`；轉後鏡時 toggle 仍然可用但預設唔鏡像
  - Verify: mock camera 下 toggle off，影出嚟「MOCK CAM」字正向；toggle on 字反向；reload 後記得設定
  - Files: `app/src/settings.ts`, `app/src/screens/Shoot.tsx`, `app/src/__tests__/settings.test.ts`
  - Size: S · Depends: —

### Checkpoint: 功能補完
- [ ] 瀏覽器 mock camera 走晒流程，輸出 1080×1350，copy 同 save 都得
- [ ] `npm test`、build、lint 全綠
- [ ] Commit + push，Vercel 自動部署成功

## Phase 3: 真機同錯誤處理

- [ ] Task 7: 錯誤狀態
  - Acceptance: camera 被拒 → 顯示「去設定開返 camera 權限」同「重試」掣；`NotFoundError` → 「搵唔到 camera」；clipboard 唔支援 → Copy 掣 disable + 提示；`saveSet` 失敗（quota）→ alert 而唔係 silent；upload 嘅卡通相 downscale 到最長邊 1600
  - Verify: mock `getUserMedia` reject 唔同 error name 檢查文字；upload 一張 4000px 相之後 IndexedDB 入面 blob 細咗
  - Files: `app/src/screens/Shoot.tsx`, `app/src/screens/Upload.tsx`, `app/src/screens/Result.tsx`, `app/src/image.ts`
  - Size: M · Depends: Task 5, 6

- [ ] Task 8: 真機 checklist
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
