# 真機測試 Checklist

網址：**https://posematch-rose.vercel.app**（而家係 Task 7 之後嘅版本）

每項打 ✅ 或者寫低問題。寫得越具體越好（邊部機、邊個瀏覽器、發生咗乜、預期係乜）。
唔使客氣，有乜唔順眼都寫，呢份嘢會變成 Task 9。

---

## A. iPhone（Safari）

### 安裝
- [ ] 用 Safari 開網址，Share → 「加至主畫面」，icon 同名稱「Post Match」正常
- [ ] 由主畫面開，係全螢幕（冇 Safari 網址列）
- [ ] 飛行模式下由主畫面開，app 開到（PWA 離線）

### 首頁 + Library
- [ ] 1 人／2 人 toggle 轉得到，library 跟住變
- [ ] Upload 4 張相（用相簿嘅截圖），排次序 ◀ ▶ 正常，刪除正常
- [ ] Save 之後返首頁，library 見到個系列同 4 格縮圖
- [ ] 刪除系列有 confirm，刪完消失
- [ ] 關 app 再開，library 仲喺度

### 影相
- [ ] 第一次入影相畫面，iOS 問 camera 權限，允許後見到前鏡畫面
- [ ] **拒絕**權限一次（之後喺設定開返），睇下錯誤訊息同「重試」掣有冇用
- [ ] 前鏡畫面係鏡像（好似照鏡）
- [ ] 「鏡像 OFF」之後畫面唔再鏡像；關 app 再開，設定記住
- [ ] 轉後鏡成功；後鏡時「鏡像」掣係灰色
- [ ] 「即影」影到；「⏱ 3 秒倒數」有大數字倒數然後影
- [ ] 影完見到定格預覽，「重影」返回 live，「下一張」去第 2 張
- [ ] 上面嘅卡通圖跟住轉（第 2 張係第 2 張卡通）
- [ ] 影完 4 張自動去成果頁
- [ ] 影相途中有電話／切去其他 app 再返嚟，camera 仲開住定黑咗？

### 成果
- [ ] 成果圖係直向 4:5，4 行，左卡通右真人，上下有白邊
- [ ] 真人嗰邊嘅方向同影相時預覽一樣
- [x] 「儲存」彈 Share sheet，入面有「儲存影像」，存到相簿（2026-10-27 iPhone ✅）
- [ ] 相簿入面張相係 **1080 × 1350**（相片 → ⓘ 睇得到）
- [ ] 直接 post 上 IG（可以唔 post，去到裁相嗰步睇下使唔使裁就得）
- [x] 「Copy Image」撳完有「已複製」toast；去 IG／WhatsApp／Notes 長按 → 貼上，貼到張 strip（2026-10-27 iPhone ✅）
- [ ] 「重新影過」返去第 1 張，卡通圖正確
- [ ] 返首頁再入同一個系列，由第 1 張開始

### 觀感（唔使修，淨係記低畀 Phase B）
- [ ] 文字大細睇唔睇得清
- [ ] 掣夠唔夠大、夠唔夠易撳
- [ ] 有冇任何嘢被 notch／底部 home bar 遮住

## B. iPad（Safari）

- [ ] 加至主畫面 + 全螢幕
- [ ] 直向：成個流程走一次（可以簡短）
- [ ] 橫向：首頁、影相、成果三個畫面會唔會爆開／奇怪
- [ ] 影相：iPad 前鏡畫面正常，影到相
- [ ] Copy Image 貼到

## C. 桌面（Chrome）

- [ ] 開 https://posematch-rose.vercel.app，網址列右邊有「安裝」icon
- [ ] Upload 用 Finder 揀 4 張相
- [ ] Camera 開到（Mac 會問權限）
- [ ] 「儲存」直接 download 一個 `.jpg`，1080×1350
- [ ] 「Copy Image」之後 ⌘V 貼入任何 app（例如 Notes、Slack）貼到張圖
- [ ] 視窗拉窄到手機闊度，layout 正常

---

## D. 要你決定嘅嘢（SPEC 嘅假設同 open questions）

試完上面之後答，每條寫「保持」或者「改做 ___」：

| # | 假設 | 試完之後 |
|---|---|---|
| 1 | IG 目標係 feed 4:5，唔係 story 9:16 | |
| 2 | Strip 上下留白用白色 | |
| 3 | 鏡像預設 ON | |
| 4 | Copy 出 PNG、Save 出 JPEG | |
| 5 | Camera 框 3:2 橫向（人要企近啲）—— **影相時好唔好用？** | 改做 4:3 取景框（Task 12），iPhone 試過 OK |

| # | Open question | 答案 |
|---|---|---|
| 1 | 要唔要同時出 9:16 story 版？ | |
| 2 | Phase B 之前有冇 reference（Figma、截圖、品牌色、鍾意嘅 app）？ | |
| 3 | 真機試完，Task 9 想先修邊啲？ | |

## E. 其他發現

（任何上面冇提到嘅嘢）

-

---

## F. Phase A2 — Pinterest 入相（iPhone）

**先由主畫面 PWA 開一次 app**（Share Target 要安裝咗先會出現喺 Share sheet；舊版已安裝嘅話要刪除再加一次主畫面，等新 service worker 生效）。

- [ ] Pinterest → 一張相 → ⋯ → 「複製圖片」→ 開 Post Match → 撳「貼上」icon → 入到裁相畫面
- [ ] Pinterest → 一張相 → Share → Share sheet 見到「Post Match」→ 揀佢 → app 開咗並入到裁相畫面
- [ ] 裁相：拖動、雙指縮放正常；「再切一張」由一張 strip 切出 4 個 pose；「唔裁」保留原相
- [ ] 裁完 → 填人數／角色名 → 入 library → 由 library 揀呢 4 張影到 strip
- [ ] 相簿 app → 揀相 → Share → Post Match（多張一齊 share）
