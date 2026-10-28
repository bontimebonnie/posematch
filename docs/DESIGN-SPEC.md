# Design Spec：Post Match Phase B（v0.2）

> 上承 [SPEC.md](SPEC.md) v0.2。Phase B **唔改功能**，只改外觀同 code 結構，令之後加圖案／element 有一套規矩跟。
> 寫法跟 `spec-driven-development`；視覉方向參考 `frontend-design`、`frontend-ui-engineering`、`design:design-system` skills。
> （你話裝咗嘅 `web-design-guidelines`／`impeccable`／`ux-writing` 三個 skill 喺 project 同 home folder 都搵唔到，呢份 spec 冇用到；裝返之後 Phase B 實作時可以用 `web-design-guidelines` 做 audit。）

---

## 0. 我假設咗嘅嘢（唔啱即刻話我知）

1. **色板跟 Bonnie 俾嘅 Chiikawa 資訊圖**（2026-10-28）：奶油底、暖棕黑字、粉彩 pill（粉紅／天藍／鵝黃／薄荷／薰衣草）、白色圓角卡配淺米色邊。舊嘅 berry 強調色退役。
2. **用系統字體**，唔加 web font（PWA 離線要快、繁中字型檔太大）。英文 system-ui，中文 PingFang／Noto Sans TC。
3. **冇 dark mode**（拍照 app，取景畫面本身就係黑底；其餘畫面維持 cream）。
4. **8pt grid 用 Tailwind 原生 scale**：只准用 `1 2 4 6 8 12 16`（4 / 8 / 16 / 24 / 32 / 48 / 64px），`1`（4px）只用喺元件內部細位。
5. **圖案／element 係 Phase B 第二步**，等 token 同 component 穩定先加，而且用一層獨立嘅「decor」token，唔同基礎 token 混埋。
6. 一個 Phase B task 只做視覺或結構，**唔動 image.ts / strip.ts / db.ts**（output 張 strip 唔會變）。

---

## 1. Objective

- **做乜**：將 Post Match 現有 5 個畫面（圖庫、裁切、匯入、拍攝、完成）重整成一套 **design guideline**：token（spacing、字級、圓角、顏色、動效）+ 一套可重用 component。之後加新 element 時，只需要用現有 token 拼。
- **點解**：SPEC 成功條件 3——「整個 UI 跟一套 design guideline，之後加 element 唔會亂」。呢個係 Bonnie 做呢個 app 嘅最終目標。
- **邊個用**：Bonnie 同朋友，手機為主（iPhone Safari／home screen PWA），平板同桌面次要。
- **成功係點**：
  1. 任何一個畫面截圖，量度任何兩個元素之間嘅距離，都係 8 嘅倍數（元件內部可以係 4）。
  2. `app/src` 入面搵唔到 token 以外嘅 spacing／顏色／圓角 class（有自動測試守住）。
  3. 新加一個 element（例如一個 sticker 掣）只需要用現有 component + token，唔需要新 CSS。
  4. 外觀「唔似 AI 做嘅 template」：有一個明確嘅個性（見 §3）。

---

## 2. 現狀 audit（2026-10-28）

| 項目 | 現狀 | 問題 |
|---|---|---|
| Spacing | 35 種值；`py-1.5` `p-0.5` `px-1.5` `py-0.5` `py-2.5` `pt-10` `mb-1` `gap-1` `p-1` 唔喺 grid | 唔一致，`px-4`（16）同 `px-3`（12）同 `px-5`（20）混用 |
| 字級 | `text-sm`×12、`text-xs`×3、`text-lg`×1、其餘 default | 冇層級，標題同內文幾乎一樣大 |
| 圓角 | `rounded-full`×18、`xl`×4、`2xl`×4、`lg`×2、`t/tl/tr` | 7 種，冇規則 |
| 顏色 | 4 個 token + 25 種 `ink/60` `black/50` 之類透明度組合 | 透明度係 ad hoc，冇語意（例如「次要文字」應該係一個 token） |
| 字重 | `bold`×4、`semibold`×3 | OK，但要定邊個用邊種 |
| 陰影 | `shadow-lg`×1 | 冇規則 |
| Icon | 全部 Iconoir，尺寸 14／20／24 混用 | 要定尺寸 scale |
| Component | `ui.tsx` 有 Button、Header、FitImage、PersonToggle；Chip、Toast、Sheet、Tray、Tile、Input 散喺 Library.tsx（387 行） | 要抽出來 |
| 字體 | `system-ui, PingFang HK, Noto Sans HK` | 繁中改咗台灣書面語，fallback 應該係 `PingFang TC, Noto Sans TC` |

---

## 3. 視覺方向（Bonnie 定，我提議起點）

**一句話**：**「Chiikawa 貼紙簿」**——奶油底、粉彩 pill、白色圓角卡、暖棕黑字；像一張手繪資訊圖，唔係一個相機 app。（色板取自 Bonnie 俾嘅 Chiikawa 圖，見 §4.4；其他 reference 遲啲補。）

- **底色**：奶油 `surface`（頁面底）同純白 `surface-raised`（卡片、chip、sheet），卡片用淺米色 `line` 做 1px 邊，唔用陰影。
- **強調色**：主要動作掣用 **粉紅 pill 配深字**（跟圖入面嘅標題 pill），一個畫面最多一個。其餘四隻粉彩（天藍／鵝黃／薄荷／薰衣草）留俾分類同 decor：例如「單人」天藍、「雙人」鵝黃、角色 chip 輪流用。
- **形狀**：兩種圓角就夠——**膠囊**（掣、chip、toggle）同 **卡片角**（圖片格、sheet）。唔再用 `lg`／`2xl` 混。
- **字**：標題用 bold 加大，內文 regular，輔助文字用 `ink-muted` 唔用細字——細字喺手機難睇。
- **圖案（Phase B 第二步）**：貼紙風格嘅 decor——例如空狀態插圖、完成頁慶祝、圖庫格背景紋理。全部用 `decor-*` token，可以一個 flag 關掉。
- **動效**：少而準——掣按下 150ms、sheet 升起 250ms、toast 淡入淡出。唔做 page transition。

> **要你決定**：見 §10 Open Questions 1–4。

---

## 4. Token 系統

全部放 `app/src/index.css` 嘅 `@theme`，Tailwind 4 會自動生成 class。

### 4.1 Spacing（8pt grid）

| Token | px | Tailwind | 用途 |
|---|---|---|---|
| `space-1` | 4 | `p-1` `gap-1` | 元件內部：icon 同字之間、badge 內距 |
| `space-2` | 8 | `p-2` `gap-2` | 格與格、chip 之間、掣內上下 |
| `space-4` | 16 | `p-4` `gap-4` | **頁面左右邊距**、區塊之間 |
| `space-6` | 24 | `p-6` | 區塊群組之間、sheet 內距 |
| `space-8` | 32 | `p-8` | 大區塊（空狀態上下） |
| `space-12` | 48 | `p-12` | 完成頁上下留白 |
| `space-16` | 64 | `p-16` | 極少用 |

**禁用**：`0.5 1.5 2.5 3 3.5 5 7 9 10 11 14`。頁面邊距統一 `px-4`。

### 4.2 字級（5 級）

| Token | size/line | weight | 用途 |
|---|---|---|---|
| `text-display` | 28/36 | bold | 完成頁「拼圖完成了！」、空狀態標題 |
| `text-title` | 20/28 | bold | Header 標題 |
| `text-body` | 16/24 | regular | 內文、掣文字（掣加 semibold） |
| `text-label` | 14/20 | semibold | chip、toggle、badge、表單 label |
| `text-caption` | 12/16 | regular | 只准用喺 count／時間等輔助數字，顏色必須 `ink-muted` |

line-height 全部 8 嘅倍數（grid 垂直節奏）。

### 4.3 圓角（3 種）

| Token | px | 用途 |
|---|---|---|
| `radius-card` | 16 | 圖片格、sheet 頂角、輸入框 |
| `radius-pill` | 9999 | 掣、chip、toggle、badge、icon 掣 |
| `radius-none` | 0 | 取景框、strip 預覽（照片本身唔圓角） |

### 4.4 顏色（語意層）

色板由 Chiikawa 資訊圖抽出（我目測取值，實作第一個 task 會喺 browser pane 併排對照再微調）。

```css
@theme {
  /* 原色：Chiikawa 粉彩 */
  --color-cream: #fff9ec;      /* 頁底 */
  --color-cocoa: #3d3632;      /* 字、線稿 */
  --color-sand: #eadfc8;       /* 卡片邊 */
  --color-pink: #f7b6c6;       /* 標題 pill、主要動作 */
  --color-pink-deep: #ef97ad;  /* 按下 */
  --color-sky: #b9d8ea;
  --color-butter: #ffe49c;
  --color-mint: #cce7b8;
  --color-lilac: #d8cceb;
  --color-blush: #f4a9b0;      /* 面珠紅，只做 decor */
  --color-navy: #5b7fb5;       /* Hachiware 藍，小面積點綴 */

  /* 語意（component 只准用呢層） */
  --color-surface: var(--color-cream);
  --color-surface-raised: #ffffff;
  --color-fg: var(--color-cocoa);
  --color-fg-muted: color-mix(in oklch, var(--color-cocoa) 62%, transparent);
  --color-fg-subtle: color-mix(in oklch, var(--color-cocoa) 40%, transparent);
  --color-line: var(--color-sand);
  --color-accent: var(--color-pink);
  --color-accent-pressed: var(--color-pink-deep);
  --color-on-accent: var(--color-cocoa);   /* 粉彩底用深字，唔用白字 */
  --color-tint-1: var(--color-sky);        /* 單人 */
  --color-tint-2: var(--color-butter);     /* 雙人 */
  --color-tint-3: var(--color-mint);
  --color-tint-4: var(--color-lilac);
  --color-on-dark: #ffffff;                /* 取景畫面上嘅字同 icon */
  --color-scrim: rgb(61 54 50 / 0.55);     /* 相上面嘅半透明掣底 */
  --color-danger: #d96b6b;
}
```

規則：component 只用語意 token；`ink/60`、`black/50` 之類透明度 class 全部換走。粉彩底一律配 `fg` 深字（對比度 ≥ 4.5:1，粉紅 #f7b6c6 配 #3d3632 約 8:1）。

### 4.5 尺寸

| Token | px | 用途 |
|---|---|---|
| `size-touch` | 44 | 所有可按元素最細高度（Apple HIG） |
| `size-icon-sm` | 16 | chip 內、badge 內 |
| `size-icon` | 24 | 掣、header |
| `size-icon-lg` | 32 | 空狀態、完成頁 |
| `size-shutter` | 72 | 快門掣 |

### 4.6 動效

| Token | 值 |
|---|---|
| `duration-fast` | 150ms（按下、hover） |
| `duration-base` | 250ms（sheet、toast） |
| `ease-out` | cubic-bezier(0.2, 0, 0, 1) |

尊重 `prefers-reduced-motion`：全部變 0ms。

### 4.7 陰影

只有一個：`shadow-sheet`（`0 -8px 24px rgb(43 36 32 / 0.12)`），用喺 EditSheet 同 PickTray。其餘唔用陰影，用 `line` 分隔。

### 4.8 Decor（Phase B 第二步先定）

`--decor-*` 獨立 namespace：pattern 圖、sticker 顏色、插圖。詳細留待 §10 Q4 答完先寫。

---

## 5. Component 清單

全部搬去 `app/src/ui/`，一個 component 一個檔，`ui/index.ts` 匯出。畫面檔只負責流程同狀態。

| Component | 來自 | 變化 |
|---|---|---|
| `Button` | ui.tsx | 加 `size: 'md' \| 'lg'`（44／56 高）、`icon` prop（左邊 Iconoir） |
| `IconButton` | 散落各處 | 44×44 膠囊，`variant: 'ghost' \| 'scrim'`（相上面用） |
| `Header` | ui.tsx | 用 `text-title`；右邊 slot |
| `Chip` | Library.tsx | 篩選用，`selected` 狀態；高 32，`text-label` |
| `SegmentedControl` | PersonToggle | 泛化：`options`，取代 PersonToggle 同鏡像開關 |
| `Tile` | Library.tsx | 3:2 圖片格；狀態：normal／selected（accent ring + 次序 badge）／disabled |
| `Badge` | Library.tsx | 次序數字、數量 |
| `Toast` | Library.tsx、Result.tsx | 統一一個，底部，`duration-base` |
| `Sheet` | EditSheet | 底部升起，`radius-card` 頂角，`shadow-sheet`，safe-area |
| `Tray` | PickTray | 已揀 4 格嘅底欄；內部用 Tile 細版 |
| `TextField` | CharacterNameInput | label + input + datalist，`radius-card`，`size-touch` |
| `EmptyState` | Library.tsx | icon-lg + display 標題 + 一句 + 一個 Button |
| `FitImage` | ui.tsx | 不變 |
| `Scrim` | Shoot.tsx | 取景框上嘅遮罩層（kept-band） |
| `Countdown` | Shoot.tsx | 數字 display 級，白色 |
| `Shutter` | Shoot.tsx | 72 圓掣 |

每個 component 有 `aria-*`、focus-visible ring（`accent`，2px offset）、`size-touch` 最細。

---

## 6. Tech Stack（不變）

Vite 8、React 19、TypeScript 6、Tailwind CSS 4（`@theme`）、iconoir-react、react-i18next。**唔加新 dependency**（有需要先問）。

## 7. Commands

```
Dev:    npm run dev --prefix app
Build:  npm run build --prefix app       # tsc -b && vite build
Lint:   npm run lint --prefix app        # oxlint
Test:   npm test --prefix app            # vitest run（含新加嘅 token 守門測試）
```

## 8. Project Structure（Phase B 後）

```
app/src/
  index.css          → @theme token（§4）+ base styles
  ui/                → 一個 component 一檔（§5），ui/index.ts 匯出
  screens/           → 只有流程同狀態，唔寫 spacing／顏色 class 以外嘅 CSS
  __tests__/
    design-tokens.test.ts  → 掃 src/**/*.tsx，唔准出現禁用 class（§4.1 禁用表、ink/xx、rounded-lg/2xl/xl）
docs/
  DESIGN-SPEC.md     → 本文件（living）
  design/            → 每個畫面 before／after 截圖（iPhone 寬 390）
```

## 9. Code Style

```tsx
// ui/Chip.tsx — 只用語意 token，spacing 喺 grid 上，可按高度 ≥ 44 用 padding 補
export function Chip({ selected, children, ...props }: ChipProps) {
  return (
    <button
      aria-pressed={selected}
      className={[
        'h-8 rounded-pill px-4 text-label transition-colors duration-fast',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        selected ? 'bg-accent text-on-accent' : 'bg-surface-raised text-fg ring-1 ring-line active:bg-line',
      ].join(' ')}
      {...props}
    />
  )
}
```

- class 順序：尺寸 → 形狀 → 間距 → 字 → 顏色 → 狀態。
- 唔用任意值 `[13px]`，除咗 safe-area `env()`。
- 顏色只用 §4.4 語意 token；`white`／`black`／`ink/60` 一律唔准。

## 10. Testing Strategy

- **自動**：`design-tokens.test.ts` 用 regex 掃 `src/**/*.tsx`，禁用 class 出現即 fail（§4.1 禁用 spacing、`rounded-(lg|xl|2xl|3xl)`、`(bg|text|ring)-(ink|black|white)/\d+`、`text-(xs|sm|base|lg|xl)`）。現有 28 個測試照跑。
- **視覺**：每個 task 用 browser pane 390 寬截圖存入 `docs/design/`，before／after 對照；Bonnie 真機睇一次。
- **無功能回歸**：`strip.test.ts`、`image.test.ts` 唔改，output 唔變。

## 11. Boundaries

- **Always**：改完 `npm run build` + `npm run lint` + `npm test`；一個 task 一個 commit；每個 task 附截圖。
- **Ask first**：加 dependency（例如 web font、動畫 library）；改 i18n 文字；改任何 `image.ts`／`strip.ts`／`db.ts`；加 dark mode。
- **Never**：為咗靚而改 strip 輸出尺寸；用 emoji 代替 Iconoir；寫 `[13px]` 之類任意值；用非語意顏色 class。

## 12. Success Criteria

- [ ] `index.css` 有 §4 全部 token，舊 `--color-*` 只剩原色層
- [ ] `ui/` 有 §5 全部 component，`Library.tsx` 跌到 < 200 行，所有 screens 唔再 import `ui.tsx`
- [ ] `design-tokens.test.ts` pass，而且故意加一個 `px-3` 會 fail
- [ ] 5 個畫面 before／after 截圖喺 `docs/design/`
- [ ] 所有可按元素 ≥ 44pt（用 browser pane `getBoundingClientRect` 掃一次）
- [ ] `prefers-reduced-motion` 下冇動畫
- [ ] 中文字體 fallback 改成 TC
- [ ] 色板同 Chiikawa 圖併排對照，Bonnie 話「係呢種感覺」
- [ ] Bonnie iPhone 真機過一次 5 個畫面，話「係我想要嘅感覺」
- [ ] 28 個舊測試照 pass，strip 輸出 byte 層面唔變（用 strip.test 現有斷言）
- [ ] （第二步）decor token 定好，至少一個 element 落地（空狀態插圖或完成頁慶祝）

## 13. Open Questions（要 Bonnie 答）

1. ~~顏色方向~~ **已答**：跟 Chiikawa 資訊圖（§4.4）。
2. ~~視覺方向~~ **已答**：先照 §3 做，Bonnie 遲啲補 reference，到時再調。
3. **字體**：接受系統字體？定係想用一隻有性格嘅標題字（會加 ~100KB 英文 web font；中文照用系統字）？
4. **圖案／element 想加啲乜**：空狀態插圖？完成頭慶祝紙屑？圖庫格背景紋理？貼紙？先講三個最想要嘅。
5. **Header 標題要唔要加 app 名／logo**？圖庫頁而家只有「圖庫」。
6. **平板／桌面**：維持 `max-w-xl` 置中就夠？定係想大螢幕用兩欄？
7. 要唔要我先裝返 `web-design-guidelines` skill，實作時每個 task 用佢 audit 一次？

---

## 14. Phase B 大致分步（approve 後先寫 plan）

B1 token → B2 ui/ component 抽出 → B3 逐個畫面套用（圖庫→匯入→裁切→拍攝→完成）→ B4 token 守門測試 + a11y 掃 → **checkpoint 真機** → B5 decor token + 第一批 element → **checkpoint 真機**。
