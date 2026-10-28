# Spec: Post Match

> 版本 0.2 · 2026-10-27 · 狀態：等待 approve（v0.1 已 approve 並做完 Phase A Task 1–8；v0.2 加入真機試完之後嘅改動）

## Objective

一個俾自己同朋友玩嘅 web app：對住卡通截圖擺同一個 pose，影 4 張相，砌成「左卡通、右真人」嘅 four-strip，可以直接 post 上 IG。

- **用家**：Bonnie 同朋友。唔係公開產品，唔使 login、唔使 analytics、唔使 error reporting。
- **點解**：想要一個靚、跟自己 design 標準嘅小 app，之後可以不斷加圖案同 element 落去玩。
- **成功**：
  1. 基本功能喺真機（iPhone、iPad、電腦）全部行到。
  2. 出嚟嘅 strip 可以直接 post 上 IG，唔使再裁。
  3. 整個 UI 跟一套 design guideline（8pt grid、統一 token），之後加 element 唔會亂。

## 做法次序（你提出嘅）

```
Phase A   基本功能 — 真機測試、補齊 spec 入面嘅功能、加測試        ✅ Task 1–8 完成
Phase A2  真機試完嘅改動 — 雙語、library 重整、貼上／share、crop、填邊   ← v0.2 新增
Phase B   Design — 定 design guideline、重整 UI 跟 8pt grid、再加圖案／element
Phase C   後話 — 裝飾框、3 人模式、pose 偵測、AI 填邊
```

Phase A 唔做視覺美化；Phase B 唔改功能。

## 功能需求（Phase A）

### A1. 語言（v0.2）
- 兩個語言：**English** 同 **繁體中文（台灣書面語）**。唔用廣東話口語。
- 跟手機語言自動揀，設定頁可以手動轉，記住選擇。
- 所有文字抽做 `locales/en.json`、`locales/zh-TW.json`，code 入面唔出現硬寫文字。
- 文案用 `design:ux-copy` skill 寫：簡短、動詞開頭、一致嘅用詞表（見 Open Questions）。
- App 名「Post Match」兩種語言都保留英文。

### A2. Library（v0.2 重整）
- Library 存**所有** upload 過嘅相，每張相獨立一條記錄，唔再有「一套 4 張」嘅系列。
- 每張相帶：**人數（1 或 2）**、**角色名**（自由輸入文字，例如 "Tom & Jerry"，有自動完成以前輸入過嘅名）。
- Library 畫面：一個 grid，頂部可以按人數同角色名篩選；可以多選刪除；可以改單張相嘅人數／角色名。
- **揀相模式**：撳「開始影相」入去揀 4 張（跟篩選），點選次序就係影相次序，可以調。揀夠 4 張先可以開始。
- 相永久存喺本機（IndexedDB），唔同步。**iOS 注意**：Safari 同「加至主畫面」係兩個獨立儲存空間；app 要喺 Safari 入面提示「加至主畫面後請由主畫面開啟」。

### A2a. 相點樣入 Library（v0.2）
三個入口，全部入 library 之前都經過 A2b 嘅 crop 畫面：
1. **揀檔案**（而家有）。
2. **貼上**：library 頁有「貼上」掣，用 `navigator.clipboard.read()`；桌面亦支援 ⌘V。Pinterest「複製圖片」之後直接貼。
3. **Share Target**（PWA）：喺 Pinterest／相簿／Safari 嘅 Share sheet 揀「Post Match」，相直接送入 app。需要 service worker 處理 POST（vite-plugin-pwa `injectManifest`）。iOS 16.4+ 支援。

### A2b. Crop（v0.2）
- 每張相入 library 之前經過 crop 畫面：拖動／縮放，框鎖 3:2 橫向。
- **「再切一張」**：同一張來源相可以切多次，每次切出嚟都係獨立一張相（用嚟由人哋嘅 strip 切出 4 個 pose、或者淨係要卡通嗰半邊）。
- 唔做 rotate。
- 切完先填人數同角色名（一次填，套用到由同一張來源切出嚟嘅所有相）。

### A2c. 非 3:2 填邊（v0.2）
- Crop 時可以揀「唔裁，填邊」：相用 contain 放入 3:2 框，空位用**模糊放大背景**填（同一張相放大 + blur + 稍微調暗）。
- AI outpaint（用外部 API 生成邊位）列入 Phase C。

### A3. 影相
- 畫面上：參考卡通圖；下：camera。
- 預設前鏡，可以轉後鏡。直向使用。
- 每次影一張；即影 或 3 秒倒數。影完可以重影，滿意先去下一張，共 4 張。
- Camera 框比例暫時維持 3:2 橫向（同 strip 每格一樣）。真機試完先決定會唔會改。
- **鏡像可以 toggle**：影相畫面有一個 mirror on/off 掣，設定會記住（localStorage）。
  - 預設：on（似 iPhone 預設「鏡像前置相機」）。
  - Toggle 同時影響預覽同輸出：預覽見到點，strip 就點。

### A4. 成果 strip
- 4 行，每行左卡通、右真人，每格 3:2。
- **輸出比例對準 IG**：整張圖出做 **4:5（1080 × 1350）**，strip 置中，上下留白（白色底）。
  - 之後 Phase C 嘅裝飾框就係填呢啲留白位。
- 三個動作：
  - **Save**：手機彈 Share sheet（可存入 Photo Library）；電腦直接 download。
  - **Copy Image**：複製 PNG 入 clipboard（Clipboard API），直接貼去 IG／WhatsApp。
  - **重新影過**。
- **唔自動 save**：關 app 就冇。

### A5. 平台
- PWA，可以加到主畫面，直向。
- 支援 iOS Safari 17+、Android Chrome、桌面 Chrome／Safari。

## 唔做（Out of scope）

- Login、雲端同步、多用戶
- 自動 pose 偵測／評分
- 裝飾框、貼紙（Phase C）
- 3 人模式（Phase C；資料結構已留位）
- 已影 strip 嘅歷史記錄
- AI 填邊（Phase C）
- 相嘅 rotate

## Tech Stack

- Vite 8 + React 19 + TypeScript 6
- Tailwind CSS 4（design token 用 `@theme`）
- Dexie 4（IndexedDB）+ dexie-react-hooks
- vite-plugin-pwa 2（v0.2 轉用 `injectManifest` 模式以支援 Share Target）
- react-i18next + i18next（v0.2）
- react-easy-crop（v0.2；要 approve 先加）
- 測試：Vitest（要加）
- 部署：Vercel，GitHub `main` 自動部署，Root Directory = `app`

## Commands

```
cd app
npm run dev          # http://localhost:5173
npm run dev:phone    # HTTPS，同 Wi-Fi 手機用
npm run build        # tsc -b && vite build
npm run lint         # oxlint
npm test             # vitest run（要加）
```

## Project Structure

```
app/
  src/
    App.tsx            畫面 router（state machine）
    db.ts              Dexie schema + saveSet / loadSetImages / deleteSet
    image.ts           Canvas helper：drawCover、loadImage、canvasToBlob
    useObjectUrls.ts   Blob → object URL hook
    ui.tsx             共用 Button / Header / PersonToggle
    screens/           Home / Library / Import(crop) / Shoot / Result / Settings
    locales/           en.json、zh-TW.json
    sw.ts              service worker（precache + share target）
    __tests__/         Vitest（要加）
  public/              icons、manifest 來源
docs/SPEC.md           呢份文件
tasks/                 plan.md、todo.md（Phase 2 先有）
.claude/skills/        agent-skills
```

## Code Style

```tsx
// 一個 screen 一個 file；props 用 inline type；event handler 用 onXxx
export default function Shoot({ cartoons, onBack, onDone }: {
  cartoons: Blob[]
  onBack: () => void
  onDone: (photos: Blob[]) => void
}) {
  const [facing, setFacing] = useState<Facing>('user')
  // ...
}
```

- 無 semicolon、single quote、2 空格（跟 Vite template）。
- 用家見到嘅文字全部經 i18n（en／zh-TW），唔喺 code 硬寫；code、comment 用英文。
- 顏色、spacing 一律用 token（`bg-berry`、`p-4`），唔 hardcode hex。
- Spacing 跟 8pt grid：Tailwind 只用 2、4、6、8、12、16（= 8、16、24、32、48、64px）；內部細位可用 1（4px）。

## Testing Strategy

- **Unit（Vitest + jsdom）**：`image.ts`（drawCover crop／mirror 數學）、`db.ts`（saveSet／deleteSet 用 fake-indexeddb）、strip 輸出尺寸。
- **手動真機 checklist**（每次改 camera／output 都要行一次）：
  - iPhone Safari：前鏡開到、轉鏡頭、倒數、mirror toggle、Save 入 Photo Library、Copy Image 貼入 IG
  - iPad：同上 + 橫直向
  - 桌面 Chrome：download、copy
- 唔做 e2e automation（camera 冇辦法喺 CI 開）。

## Boundaries

- **Always**：改完 run `npm run build` 同 `npm run lint`；UI 文字用廣東話；spacing 跟 8pt。
- **Ask first**：加 npm dependency；改 Dexie schema version；改 strip 輸出比例；改 camera 比例。
- **Never**：commit `.vercel/`、token；自動將相上傳到任何 server；刪除 failing test。

## Success Criteria（Phase A2 完成）

- [ ] 轉語言之後所有畫面冇漏網嘅舊文字；zh-TW 文案經你睇過
- [ ] Library 可以按人數同角色名篩選；由 library 揀任意 4 張開始影相
- [ ] iPhone：Pinterest 複製圖片 → app 貼上 → crop → 入 library
- [ ] iPhone：Pinterest Share sheet 見到「Post Match」，分享後相出現喺 crop 畫面
- [ ] 一張 strip 來源相可以切出 4 張獨立嘅相
- [ ] 非 3:2 嘅相用填邊模式後，成果 strip 冇白位
- [ ] 舊版 library 嘅相（一套 4 張）升級後仍然喺度，自動變成獨立相 + 角色名 = 原本系列名
- [ ] `npm test`、build、lint 零錯誤

## Success Criteria（Phase A 完成）

- [ ] iPhone、iPad、桌面各走一次完整流程成功
- [ ] 輸出圖係 1080×1350 PNG/JPEG，IG post 唔使裁
- [ ] Copy Image 喺 iOS Safari 同桌面 Chrome 都貼到
- [ ] Mirror toggle 預覽同輸出一致
- [ ] Vitest 有 cover `image.ts`、`db.ts`，`npm test` 通過
- [ ] `npm run build`、`npm run lint` 零錯誤

## v0.2 假設（唔啱就話）

1. App 名「Post Match」唔翻譯。
2. Crop 唔使 rotate。
3. 填邊先做模糊，AI 之後。
4. 角色名係自由文字（唔係固定清單），靠自動完成保持一致。
5. 舊資料升級：原本每個系列嘅 4 張相變成 4 張獨立相，角色名 = 系列名。

## v0.2 Open Questions

1. **真機 checklist D 部分未填**：Copy Image 喺 iPhone 貼到入 IG 未？儲存入相簿成功未？Camera 3:2 框影相時好唔好用？呢三樣決定 Task 9。
2. 用詞表：「Library」中文叫「圖庫」？「Strip」叫「拼圖」定「照片條」？「Shoot」叫「拍攝」？我會用 ux-copy 出一版俾你揀。
3. 筛選要唔要記住上次揀咗乜（例如上次揀「2 人 + Tom & Jerry」）？我估要。

## v0.1 假設（唔啱就話）

1. IG 目標係 **feed post 4:5**，唔係 story 9:16。
2. Strip 輸出用 **白色底** 留白（Phase C 先加框）。
3. Mirror 預設 **on**。
4. Copy Image 輸出 **PNG**（clipboard 只支援 PNG）；Save 用 JPEG。
5. Phase B 嘅 design guideline 由你定方向（顏色、字體、圓角、圖案風格），我負責寫成 token 同 component。

## v0.1 Open Questions

1. 輸出比例：4:5 feed 啱唔啱？定係想同時出 9:16 story 版？
2. Phase B 開始之前，你有冇現成嘅 reference（Figma、截圖、品牌色）可以俾我？
3. 真機測試你想幾時做？做完先開始 Phase A 嘅功能補完，定係我先補功能你一次過試？
