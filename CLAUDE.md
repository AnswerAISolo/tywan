# CLAUDE.md

## 專案：tywan — AI 語音輸入工具

基於 VoiceType v0.1.0 改造，使用 Python 開發。

## 技術棧
- Python 3.10+
- sounddevice（音訊錄製）
- OpenAI / Groq API（STT + LLM）
- pystray（系統匣）
- keyboard（全域快捷鍵）
- pyperclip + pyautogui（文字注入）
- HTTP server + settings.html（Web 設定介面）

## 設定檔路徑
- Windows: `%APPDATA%\tywan\config.json`

## 開發指引
- 所有回覆使用繁體中文（臺灣）
- 品牌名稱統一為 tywan
- 使用 conventional commits
