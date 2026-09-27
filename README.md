# Wordly + ListenLoop

一個把**英文單字建立**與**美式英文聽力／口說練習**放在同一個學習流程中的 Expo Web／PWA 行動應用程式。

> 本 repo `apoprotein-stack/english-word-practice` 是目前唯一的主 repo。原本的 ListenLoop repo 已不再是後續開發來源；所有新功能、部署與版本管理都應集中在本 repo。

## 產品定位

Wordly 解決「我認得這個字嗎？」；ListenLoop 解決「我能在真實語境中聽懂、說出來嗎？」。

整合後的核心學習循環：

```mermaid
flowchart LR
  A[選擇程度] --> B[Wordly 單字練習]
  B --> C[聽力語境練習]
  C --> D[文字或口說回答]
  D --> E[理解回饋]
  E --> F[本機學習紀錄]
  F --> A
```

## 目前功能

### Wordly：單字學習

- Today 首頁：每日目標、連續天數、學習進度與今日單字。
- Practice：四級單字練習與五題小測驗。
- Library：瀏覽單字、發音、詞性、定義、中文翻譯與例句。
- Records：本週學習量、總單字數、熟悉度與最近活動。
- 使用 AsyncStorage 保存每日完成數、總學習單字、連續天數、每週統計與學習活動。

### ListenLoop：聽力與口說

- Listen 分頁：每日一段 30–60 秒美式英文內容。
- 30 天題庫，涵蓋簡單、中等、高級、專業四種難度。
- 每篇內容包含逐字稿、兩道理解題、關鍵資訊與自然英文回答。
- 支援瀏覽器 TTS 播放，以及瀏覽器支援時的麥克風語音辨識。
- 文字回答或口說回答後，顯示抓到的重點與自然說法。
- 難度選擇會保存到本機，日期切換時自動取得當日內容。
- ListenLoop 的每日完成紀錄與原本 Wordly 的 Records 分開保存，避免兩種學習資料互相覆蓋；後續可再做跨模組統計。

## 導覽結構

| 分頁 | 主要目的 | 主要資料來源 |
|---|---|---|
| Today | 看今日目標、挑選程度、開始單字學習 | `lib/learning-storage.ts`、`lib/word-practice.ts` |
| Listen | 聽力、逐字稿、理解題、口說回答 | `lib/lesson-data.ts`、`lib/practice-progress.tsx` |
| Practice | 單字測驗與答案評分 | `lib/word-practice.ts` |
| Library | 單字瀏覽與查詢 | `lib/word-practice.ts` |
| Records | 單字學習統計與最近活動 | `lib/learning-storage.ts` |

## 技術架構

```text
app/
  _layout.tsx                 # 根 Provider、PWA 註冊、Stack
  (tabs)/
    index.tsx                 # Wordly Today
    listen.tsx                # ListenLoop 聽力主畫面
    practice.tsx              # Wordly 單字測驗
    library.tsx               # 單字庫
    progress.tsx              # Records

lib/
  word-practice.ts            # Wordly 程度、單字與評分規則
  learning-storage.ts         # Wordly AsyncStorage 學習紀錄
  lesson-data.ts              # ListenLoop 30 天題庫與四級難度
  practice-progress.tsx       # ListenLoop AsyncStorage Provider
  pwa.ts                      # Web Service Worker 註冊

public/
  manifest.json               # PWA 安裝資訊
  sw.js                       # 快取與離線導覽
  offline.html                # 離線 fallback
  icon-*.png                  # PWA 圖示

.github/workflows/
  deploy-pages.yml            # GitHub Pages 自動建置與部署
```

### 資料流原則

1. **畫面只負責互動與呈現**，單字規則放在 `lib/word-practice.ts`，聽力題庫放在 `lib/lesson-data.ts`。
2. **本機持久化分成兩個 namespace**：Wordly 使用 `@wordly/learning-record-v1`；ListenLoop 使用自己的 practice progress key。
3. **不要求外部 API key**：目前題庫與語音功能可在前端執行；未來需要雲端同步或 AI 評分時，再把服務層加入 `server/`。
4. **Expo Router 負責跨平台路由**：同一套畫面可供 Web、PWA 與日後原生平台使用。

## PWA 與 GitHub Pages

PWA 已包含：

- `manifest.json`：standalone 顯示模式、圖示與主畫面名稱。
- `sw.js`：依 Service Worker scope 快取資源，支援離線 fallback。
- `offline.html`：無網路時的友善畫面。
- `lib/pwa.ts`：Web 啟動後註冊 Service Worker。
- `experiments.baseUrl`：當 `GITHUB_PAGES=true` 時使用 `/english-word-practice` 子路徑。
- `.github/workflows/deploy-pages.yml`：推送 `main` 後自動匯出與部署。

### 本機驗證

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm check
GITHUB_PAGES=true pnpm pwa:export
```

靜態匯出後會產生 `dist/`，workflow 會額外建立 `dist/404.html` 與 `.nojekyll`，以支援 GitHub Pages 的 SPA 路由。

### GitHub Pages 啟用方式

在 repo 的 GitHub 設定中：

1. 開啟 **Settings → Pages**。
2. 將 Source 設為 **GitHub Actions**。
3. 推送到 `main`，或在 **Actions** 手動執行 `Deploy Wordly + ListenLoop to GitHub Pages`。

目前 workflow 的靜態建置已在本機通過；若 Actions 顯示 `Creating Pages deployment failed / 404`，通常代表 Pages 尚未在 repo 設定中啟用，而不是 Expo 匯出失敗。

## 後續產品想法

### 1. 建立「單字 → 語境」連動

完成 Wordly 單字後，ListenLoop 優先挑選包含該單字或同義詞的聽力內容。這會讓單字不只停留在記憶卡，而是立即進入句子與情境。

### 2. 統一學習紀錄

目前兩個模組先分開保存，下一階段可建立統一的 `LearningEvent`：

```ts
type LearningEvent = {
  id: string;
  date: string;
  module: "word" | "listening" | "speaking";
  level: string;
  score?: number;
  durationSeconds?: number;
  completed: boolean;
};
```

如此 Records 可以顯示「今天學了 10 個字、完成 1 段聽力、口說回答正確率 75%」。

### 3. 從 30 天題庫升級成可擴充內容包

把題庫從單一 TypeScript 陣列抽象成 JSON／資料表格式，支援：

- 主題：旅行、工作、生活、學術。
- 難度：簡單、中等、高級、專業。
- 技能標籤：主旨、細節、因果、時間、口說流暢度。
- 題目版本與內容更新，不必修改畫面元件。

### 4. 加入間隔重複與弱點補強

依錯題與漏聽的關鍵字建立「明日複習清單」，不要只依日期線性播放。這會比單純完成 30 天更能提高長期記憶。

### 5. AI 回饋服務化

目前回饋採本地關鍵字比對，可靠、快速且不需要 API key。未來若需要更自然的英文評分，可以加入 server-side LLM 服務，但應保留本地 fallback，確保 PWA 離線時仍能完成基本練習。

## 開發規範

- 使用 `ScreenContainer` 包住所有畫面。
- `Pressable` 使用 `style`，不要依賴 `className` 的互動樣式。
- 清單使用 `FlatList`，避免大型內容用 `ScrollView.map()`。
- 新增圖示前，先在 `components/ui/icon-symbol.tsx` 加入映射。
- 修改資料模型時，同步更新 Vitest 測試。
- 不把 API key 或秘密寫入 repo；外部服務設定使用 GitHub Secrets 或 WebDev secrets。

## 狀態與來源管理

- **唯一後續開發來源**：`https://github.com/apoprotein-stack/english-word-practice`
- **主要分支**：`main`
- **舊 ListenLoop repo**：已停止作為後續開發來源；在新 repo 的 Pages、測試與功能驗證完成前，建議先保留或封存，不要刪除。
- **刪除原 repo 前置條件**：新 repo Pages 成功、PWA 可安裝、五個分頁可正常開啟、AsyncStorage 紀錄可恢復，且已保留必要的 Git 歷史備份。
