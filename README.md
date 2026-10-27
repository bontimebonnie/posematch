# Post Match

模仿卡通 pose 嘅 four-strip 影相 web app。

Live: https://posematch-rose.vercel.app（push 上 `main` 會自動部署）

## 開發

```bash
cd app
npm install
npm run dev          # 電腦：http://localhost:5173
npm run dev:phone    # 手機／iPad：用同一個 Wi-Fi，開 terminal 顯示嘅 https://192.168.x.x:5173
```

手機開 camera 一定要 HTTPS，`dev:phone` 會用自簽證書，第一次開會問你信唔信任，撳「繼續」就得。

## 結構

- `src/db.ts` — IndexedDB（Dexie）：每張卡通相獨立存，一套 4 張做一個 set，帶 personCount（1 或 2）
- `src/screens/Home.tsx` — 揀人數、library、upload 入口
- `src/screens/Upload.tsx` — 揀 4 張相、排次序、save
- `src/screens/Shoot.tsx` — 上面卡通、下面 camera，即影／3 秒倒數／重影／轉鏡頭
- `src/screens/Result.tsx` — Canvas 砌 four-strip，儲存／分享

## 部署

Vercel project `posematch`，Root Directory 設咗做 `app`（因為 app 唔係喺 repo root）。push 上 `main` 就自動 build 同部署。

## Agent skills

`.claude/skills/` 係 [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) 嘅 symlink（實體喺 `.agents/skills/`），用 `npx skills add addyosmani/agent-skills` 更新。
