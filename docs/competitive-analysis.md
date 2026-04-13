# AI 語音輸入工具 — 競品分析報告

## Typeless 產品概覽

**定位**：AI 語音聽寫工具，將自然語音轉為打磨好的文字，號稱比打字快 4 倍。

### 核心功能

| 功能 | 說明 |
|------|------|
| 智慧轉錄 | 自動移除語助詞（嗯、啊）、偵測口誤只保留最終意圖 |
| AI 文字打磨 | 經 LLM 處理後輸出乾淨、有結構的文字 |
| 依 App 調整語氣 | 信件較正式、聊天較口語，自動切換 |
| Whisper 模式 | 低聲說話也能辨識，適合公共場所 |
| 翻譯 | 說 A 語言，輸出 B 語言 |
| Ask Anything | 內建 AI 助手，可語音提問 |
| 個人化學習 | 隨時間學習使用者的用詞習慣與風格 |
| 自訂字典 | 專業術語、人名、縮寫 |
| 語音指令 | 「換行」「新段落」等格式控制 |
| 100+ 語言 | 自動偵測語言切換，支援多語混用 |

### 平台支援

macOS、Windows、iOS（自訂鍵盤）、Android（自訂鍵盤）、Web App（瀏覽器）— **五平台全覆蓋**。

### 定價

| 方案 | 價格 | 內容 |
|------|------|------|
| Free | $0 | 8,000 字/週 |
| Pro | $12/月（年付）/ $30/月 | 無限字數、團隊管理 |

### 技術推測

- **STT**：雲端 Whisper（或微調版本），音訊送至 AWS us-east-2
- **LLM 層**：GPT-4 等級模型處理文字打磨、去語助詞、修正口誤
- **情境感知**：偵測前景 App 類型（信件/聊天/程式碼），調整輸出風格
- **純雲端**：無離線模式，所有音訊離開裝置處理

### 已知缺點

1. **隱私疑慮** — 純雲端處理，無 SOC 2 認證（Wispr Flow 有）
2. **6 分鐘錄音上限** — 長篇聽寫會被打斷
3. **無離線模式** — 必須聯網
4. **缺開發者整合** — 無 IDE 插件（Wispr Flow 有 Cursor 整合）
5. **iOS 鍵盤體驗有摩擦** — Apple 對第三方鍵盤限制多

---

## OpenTypeless（開源替代品）

**GitHub**: https://github.com/tover0314-w/opentypeless

### 技術棧

| 層級 | 技術 |
|------|------|
| 框架 | **Tauri v2**（Rust 後端 + Web 前端）|
| 前端 | React 19 + TypeScript + Vite 7 + Tailwind CSS 4 |
| 狀態管理 | Zustand 5 |
| 音訊錄製 | cpal（Rust 跨平台音訊庫）|
| 鍵盤模擬 | enigo（模擬鍵盤輸入到任意 App）|
| 剪貼簿 | arboard |
| 資料庫 | SQLite（rusqlite）|
| 全域快捷鍵 | tauri-plugin-global-shortcut |

### 架構特色

- **多 STT 引擎**：Deepgram（即時 WebSocket 串流）、OpenAI Whisper、Groq Whisper、AssemblyAI、SiliconFlow、GLM-ASR
- **多 LLM 引擎**：OpenAI、Claude、DeepSeek、Gemini、Ollama、Qwen 等（透過 OpenAI 相容 API）
- **Pipeline 流程**：Recording → Transcribing → Polishing → Outputting
- **文字注入**：兩種模式 — 鍵盤模擬（enigo 逐字輸入）或剪貼簿模式（寫入剪貼簿 + 模擬 Ctrl+V）
- **情境感知**：偵測前景 App 類型，調整 LLM prompt
- **音訊處理**：麥克風錄音後重採樣至 16kHz mono，最大緩衝 ~24MB（約 12.5 分鐘）

### 關鍵目錄結構

```
src/                    # React 前端
  components/           # HomePage, Settings, Onboarding, History, Capsule（浮動 widget）
  stores/appStore.ts    # Zustand 狀態管理
  lib/tauri.ts          # Tauri invoke 封裝

src-tauri/              # Rust 後端
  src/pipeline.rs       # 核心 pipeline 編排
  src/audio/capture.rs  # 麥克風錄音（cpal）
  src/stt/              # STT 提供者（deepgram, whisper_compat, assemblyai, cloud）
  src/llm/              # LLM 提供者（openai 相容, prompt 建構）
  src/output/           # 文字輸出（keyboard.rs, clipboard.rs）
  src/app_detector/     # 前景 App 偵測
  src/storage/          # 歷史紀錄與字典（SQLite）
```

---

## 競爭格局

| 產品 | 平台 | 處理方式 | 年費 | 免費額度 | 核心差異 |
|------|------|----------|------|----------|----------|
| **Typeless** | Mac/Win/iOS/Android/Web | 雲端 | $144 | 8,000 字/週 | 最廣平台覆蓋 + 自動修正口誤 |
| **Wispr Flow** | Mac/Win/iOS/Android | 雲端 | $144 | 2,000 字/週 | SOC2/HIPAA、IDE 整合、$8100 萬融資 |
| **Aqua Voice** | Mac/Win | 雲端 | $96 | 1,000 字（一次性）| 專為程式碼訓練的模型、SOC 2 |
| **Voibe** | macOS（Apple Silicon）| 完全本地 | $99 買斷 | 7 天試用 | 完全隱私、無雲端、VS Code 整合 |
| **Superwhisper** | macOS | 本地+雲端 | $99 買斷 | 試用 | 高度自訂、混合架構 |
| **VoiceInk** | macOS | 本地 | $25 買斷 | 試用 | 開源、最便宜 |
| **OpenTypeless** | Mac/Win/Linux | BYOK（自帶 API Key）| 免費 | 無限 | 開源、多引擎支援 |

---

## tywan 的機會點

1. **隱私優先** — 支援本地 Whisper + 本地 LLM（Ollama），完全離線運行
2. **開發者體驗** — IDE 整合（VS Code、Cursor）、程式碼語境理解
3. **Windows 優先** — 多數競品以 macOS 為主，Windows 市場有空缺
4. **Tauri 架構** — 比 Electron 輕量，OpenTypeless 已驗證可行性
5. **中文最佳化** — 針對繁體中文做特別優化（標點、斷句、用語）
6. **無錄音上限** — 解決 Typeless 的 6 分鐘限制
7. **彈性定價** — BYOK 模式免費 + 可選雲端訂閱
