# UX Copy — Post Match

版本 1 · 2026-10-27 · 對應 `app/src/locales/en.json`、`zh-TW.json`

## Voice

- **Friendly, light, quick.** 這是和朋友一起玩的小工具，不是生產力軟體。
- **動詞開頭的按鈕**，每個按鈕說清楚按下去會發生什麼（"Add pictures"、"Start shooting"），不用 "OK"、"Submit"。
- **錯誤 = 發生什麼 + 怎麼辦**，不責怪使用者（"Camera access is off. Allow it in your browser settings, then tap Try again."）。
- **確認對話框說清楚後果**（"Delete 3 pictures? This can't be undone."），按鈕用動作名稱。
- 英文：sentence case，不用驚嘆號轟炸（成果頁可以有一個）。
- 中文：台灣繁體**書面語**，簡短、自然，不用港式口語（唔／嘅／撳），不用大陸用語（视频／软件）。按鈕 2–4 字為主。

## 用詞表（Glossary）

| 概念 | English | 繁體中文 | 備注 |
|---|---|---|---|
| App 名 | Post Match | Post Match | 不翻譯 |
| 圖庫（所有上傳的卡通圖） | Library | 圖庫 | 不用「相簿」，避免和手機相簿混淆 |
| 卡通圖（一張） | picture | 圖片 | 卡通／貼圖／截圖統稱 |
| 真人照 | photo | 照片 | 相機拍的 |
| 成品 | strip / four-strip | 拼圖／四格拼圖 | 不用「照片條」 |
| 拍攝流程 | shoot / shooting | 拍攝 | 動詞 "Start shooting" → 開始拍攝 |
| 一張成果內的一格 | shot | 第 N 張 | "Shot 1 of 4" → 第 1 / 4 張 |
| 角色 | character | 角色 | 人數 = "How many characters" → 幾個角色 |
| 角色名稱 | character name | 角色名稱 | |
| 人數（1／2） | 1 person / 2 people | 1 人／2 人 | |
| 鏡像 | Mirror | 鏡像 | 開／關 → on/off → 開／關 |
| 切換鏡頭 | Flip camera | 切換鏡頭 | |
| 裁切 | Crop | 裁切 | 不用「剪裁」 |
| 從同一張再裁 | Cut another | 再裁一張 | |
| 貼上 | Paste | 貼上 | |
| 分享（系統分享表） | Share | 分享 | iOS 系統用語 |
| 儲存 | Save | 儲存 | 不用「保存」 |
| 複製圖片 | Copy image | 複製圖片 | |
| 重拍 | Retake | 重拍 | 單張；整組 = 重新拍攝 |
| 倒數 | timer | 秒倒數 | "3s timer" → 3 秒倒數 |
| 參考圖 | reference | 參考姿勢 | |

## Key 命名

`screen.element`，例如 `shoot.retake`、`library.empty_title`。共用字放 `common.*`。
數量用 i18next 複數：`people_one` / `people_other`。

## Localization notes

- 中文不分單複數，`_one` 與 `_other` 內容相同。
- 中文字串通常比英文短；英文按鈕要容得下 "Cut another from this picture"（最長）。
- "Instagram" 兩種語言都保留英文。
- 「刪除後無法復原」固定用這句。
