# NoType — AI 語音輸入工具

## 專案簡介
NoType 是一個 AI 語音輸入工具，讓使用者不需要打字，透過語音即可完成文字輸入。類似 Typeless，但使用者自帶 API Key，程式常駐系統匣。

## 關鍵時程
- 專案啟動：2026-04-12
- v0.1 完成：2026-04-12（核心功能完整，可端對端運作）

## 語言與風格
- 所有回應、文件皆使用**繁體中文**
- 修改前先確認計畫，優先保留原有資料結構

## 技術架構
- **框架**：Electron（系統匣常駐 + Web UI 設定頁）
- **STT**：OpenAI Whisper API / Groq Whisper API（使用者在設定中切換）
- **LLM 潤飾**：OpenAI GPT-4o-mini / Groq Llama 3.3（移除贅詞、修正文法、自動標點）
- **鍵盤模擬**：koffi 呼叫 Windows `keybd_event` API（剪貼簿 + Ctrl+V）
- **按鍵偵測**：koffi 呼叫 Windows `GetAsyncKeyState` API（偵測按住/放開）
- **設定儲存**：electron-store v8（JSON 存本地，CJS 格式）
- **圖示生成**：pngjs 程式化繪製 64x64 藍色麥克風 PNG

## 目前進度
- [x] 專案初始化
- [x] 規劃核心功能與技術架構
- [x] Electron 骨架 + 系統匣（藍色麥克風圖示）
- [x] 設定頁面 UI + 本地儲存（IPC 通訊）
- [x] 語音錄製模組（MediaRecorder + 隱藏視窗）
- [x] STT API 模組（OpenAI Whisper / Groq）
- [x] LLM 文字潤飾模組
- [x] 鍵盤模擬輸入模組（koffi + Windows API）
- [x] 全域快捷鍵：按住 Left Alt+Space 錄音，放開停止
- [x] 錄音狀態浮動視窗（錄音中/辨識中/潤飾中/完成/錯誤）
- [x] 修正鍵盤卡住問題（貼上前強制釋放所有修飾鍵）
- [ ] 端到端測試確認文字成功輸入到目標欄位
- [ ] 體驗優化（圖示狀態變化、錯誤提示、開機啟動等）
- [ ] 打包成 Windows 安裝檔（electron-builder）

## 開發過程中遇到的問題與解法

### 1. electron-store v11 不相容 CommonJS
- **問題**：`Store is not a constructor` — v11 是 ESM-only
- **解法**：降級至 electron-store v8（最後一個 CJS 版本）
- **注意**：v8 不支援 `encryptionKey` 參數，已移除

### 2. node-global-key-listener 無法在 Electron 中使用
- **問題**：`spawn UNKNOWN` — 它試圖 spawn 子程序，被 Electron 沙箱阻擋
- **解法**：改用 `koffi`（純 JS FFI，有 prebuilt binary）直接呼叫 Windows `GetAsyncKeyState` API

### 3. uiohook-napi 需要 Visual Studio 編譯
- **問題**：`Could not find any Visual Studio installation` — native addon 需要 C++ 編譯器
- **解法**：放棄 uiohook-napi，統一使用 koffi（不需要編譯）

### 4. @nut-tree-fork/nut-js 鍵盤模擬無效
- **問題**：同樣需要原生編譯，且可能根本沒有正確載入
- **解法**：改用 koffi 呼叫 Windows `keybd_event` API 模擬 Ctrl+V

### 5. Alt 鍵卡住導致鍵盤無法使用
- **問題**：按住 Alt+Space 錄音後放開，系統仍認為 Alt 被按住，模擬的 Ctrl+V 變成 Alt+Ctrl+V
- **解法**：在 `typer.js` 中，模擬 Ctrl+V 前後都呼叫 `releaseAllModifiers()` 強制釋放 Alt/Space/Ctrl
- **狀態**：已修正，待使用者確認是否完全解決

### 6. SVG 圖示在 Windows 系統匣不顯示
- **問題**：Electron 的 `nativeImage.createFromDataURL` 對 SVG 支援不完整
- **解法**：用 `pngjs` 程式化繪製 64x64 PNG 圖示（`scripts/generate-icon.js`）

## 關鍵設計決策
- **koffi 是核心依賴**：取代了 node-global-key-listener、uiohook-napi、@nut-tree-fork/nut-js 三個套件，統一用 Windows API 處理按鍵偵測和鍵盤模擬
- **按住錄音機制**：globalShortcut 偵測 Alt+Space 按下 → 開始錄音 + setInterval 每 80ms 用 GetAsyncKeyState 檢查按鍵 → 放開時停止錄音
- **文字輸入方式**：剪貼簿寫入 + 模擬 Ctrl+V，相容中文輸入法和所有應用程式
- **隱藏錄音視窗**：主程序無法使用 MediaRecorder，所以用一個隱藏的 BrowserWindow 執行錄音，透過 IPC 傳遞音訊資料

## 最近更動紀錄
| 日期 | 變更摘要 | GitHub |
|------|----------|--------|
| 2026-04-12 | 專案初始化 | ✅ |
| 2026-04-12 | 完成 v0.1：骨架、設定頁、錄音、STT、LLM、鍵盤輸入 | 待推送 |
| 2026-04-12 | 修正圖示（SVG→PNG）、快捷鍵（toggle→按住）、鍵盤卡住問題 | 待推送 |
| 2026-05-02 | 修正 4 個不穩定問題（見下方 #7）；換 LLM model | 待推送 |

### 7. 不穩定問題修正（2026-05-02）
- **LLM 429**：`llama-3.3-70b-versatile` 帳號無開放 → 換成 `llama-3.1-8b-instant`
- **Race condition**：`handleAudioData` 執行期間（5-10 秒）再按 Right Alt 會開新錄音 → 加 `isBusy` 鎖
- **誤觸保護**：錄音低於 500ms 直接丟棄，不送 API
- **孤兒視窗**：`stopRecordingAndProcess` 原本呼叫 `createRecorderWindow()` 會建多餘視窗 → 改用模組層級變數

## 資料夾結構
```
notype/
├── package.json
├── CLAUDE.md
├── .gitignore
├── assets/
│   ├── icon.png             # 64x64 藍色麥克風圖示（pngjs 生成）
│   └── icon.svg             # SVG 版本（備用，系統匣未使用）
├── scripts/
│   └── generate-icon.js     # 圖示生成腳本
└── src/
    ├── main.js              # Electron 主程序入口 + IPC handlers
    ├── tray.js              # 系統匣管理
    ├── store.js             # 本地設定存儲（electron-store v8）
    ├── recorder.js          # 錄音浮動視窗管理
    ├── recorder-page.html   # 隱藏錄音頁面（MediaRecorder）
    ├── recorder-preload.js  # 錄音頁面 preload
    ├── overlay.html         # 錄音狀態浮動提示
    ├── overlay-preload.js   # 浮動提示 preload
    ├── shortcut.js          # 全域快捷鍵 + 錄音流程控制（koffi）
    ├── typer.js             # 鍵盤模擬輸入（koffi + keybd_event）
    ├── api/
    │   ├── whisper.js       # OpenAI Whisper STT
    │   ├── groq.js          # Groq Whisper STT
    │   └── llm.js           # LLM 文字潤飾
    └── settings/
        ├── index.html       # 設定頁面（深色主題）
        ├── settings.js      # 設定頁面邏輯
        ├── settings.css     # 設定頁面樣式
        └── preload.js       # 設定頁面 preload
```

## 下次開工優先事項
1. **確認端到端流程**：Alt+Space 錄音 → STT → LLM 潤飾 → 文字出現在目標欄位
2. **如果文字仍未出現**：加入更多 console.log 除錯，確認每個步驟是否正確執行
3. **體驗優化**：系統匣圖示狀態變化、錯誤彈窗提示、開機自動啟動
4. **打包**：用 electron-builder 產出 Windows 安裝檔

## 同步資訊

| 平台 | 路徑 / 位置 | 用途 |
|------|-------------|------|
| 本機 | `C:\2026三師爸\claude_code\notype\` | 主要工作目錄 |
| GitHub | `mathruffian-dot/notype` | 版本控制與備份 |

## 工作注意事項
- 當使用者說「結束」、「休息」或「暫停」時，自動記錄進度並更新此檔案
- 新增或修改檔案後，更新「資料夾結構」與「最近更動紀錄」
- **此專案不能使用需要 Visual Studio 編譯的原生套件**，統一用 koffi 呼叫 Windows API
