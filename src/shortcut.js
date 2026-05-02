const { BrowserWindow } = require('electron');
const path = require('path');
const koffi = require('koffi');
const { getStore } = require('./store');
const { showOverlay, hideOverlay, saveAudioBuffer, cleanupTempAudio } = require('./recorder');
const { transcribeWithWhisper } = require('./api/whisper');
const { transcribeWithGroq } = require('./api/groq');
const { polishText } = require('./api/llm');
const { typeText, copyToClipboard } = require('./typer');

let recorderWindow = null;
let isRecording = false;
let detectTimer = null;
let prevRAltDown = false;

// Windows API: GetAsyncKeyState
const user32 = koffi.load('user32.dll');
const GetAsyncKeyState = user32.func('short __stdcall GetAsyncKeyState(int vKey)');

// Virtual Key Codes
const VK_RMENU = 0xA5;  // Right Alt
const VK_SPACE = 0x20;  // Space

function isKeyDown(vk) {
  // 高位元組被設定 = 鍵正被按住
  return (GetAsyncKeyState(vk) & 0x8000) !== 0;
}

// 建立隱藏的錄音視窗
function createRecorderWindow() {
  if (recorderWindow) return recorderWindow;

  recorderWindow = new BrowserWindow({
    show: false,
    width: 1,
    height: 1,
    webPreferences: {
      preload: path.join(__dirname, 'recorder-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  recorderWindow.loadFile(path.join(__dirname, 'recorder-page.html'));

  recorderWindow.on('closed', () => {
    recorderWindow = null;
  });

  return recorderWindow;
}

// 啟動按鍵偵測：偵測 Right Alt 的「按下瞬間」做切換
function registerShortcut() {
  if (detectTimer) clearInterval(detectTimer);
  prevRAltDown = false;

  // 每 50ms 檢查 Right Alt 是否從鬆開→按下（rising edge）
  detectTimer = setInterval(() => {
    const rAltDown = isKeyDown(VK_RMENU);

    // 只在「鬆開→按下」的瞬間觸發一次（避免按住時連續觸發）
    if (rAltDown && !prevRAltDown) {
      if (!isRecording) {
        startRecording();
      } else {
        stopRecordingAndProcess();
      }
    }

    prevRAltDown = rAltDown;
  }, 50);

  console.log('按鍵偵測已啟動：按 Right Alt 開始錄音，再按一次停止');
  return true;
}

// 開始錄音
function startRecording() {
  if (isRecording) return;
  isRecording = true;
  showOverlay('recording');

  const win = createRecorderWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send('start-recording');
    console.log('開始錄音（再按一次 Right Alt 停止）');
  } else {
    console.error('錄音視窗初始化失敗');
    isRecording = false;
    hideOverlay();
  }
}

// 停止錄音並處理
function stopRecordingAndProcess() {
  if (!isRecording) return;
  isRecording = false;

  const win = createRecorderWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send('stop-recording');
    console.log('停止錄音，開始處理');
  } else {
    console.error('錄音視窗不可用，停止失敗');
    hideOverlay();
  }
}

// 處理錄音完成的音訊資料
async function handleAudioData(audioBuffer) {
  const store = getStore();

  try {
    const audioPath = saveAudioBuffer(audioBuffer);

    // STT 辨識
    showOverlay('processing');
    const provider = store.get('sttProvider') || 'openai';
    let rawText;

    if (provider === 'groq') {
      rawText = await transcribeWithGroq(audioPath);
    } else {
      rawText = await transcribeWithWhisper(audioPath);
    }

    console.log('STT 結果:', rawText);

    if (!rawText || rawText.trim() === '') {
      showOverlay('done');
      setTimeout(hideOverlay, 1500);
      cleanupTempAudio();
      return;
    }

    // LLM 潤飾
    showOverlay('polishing');
    const polishedText = await polishText(rawText);
    console.log('潤飾結果:', polishedText);

    // 輸入文字
    const copyOnly = store.get('copyToClipboard');
    if (copyOnly) {
      copyToClipboard(polishedText);
    } else {
      await typeText(polishedText);
    }

    showOverlay('done');
    setTimeout(hideOverlay, 1500);
  } catch (err) {
    console.error('處理錄音失敗:', err);
    showOverlay('error');
    setTimeout(hideOverlay, 3000);
  } finally {
    cleanupTempAudio();
  }
}

function unregisterShortcut() {
  if (detectTimer) {
    clearInterval(detectTimer);
    detectTimer = null;
  }
}

module.exports = { registerShortcut, unregisterShortcut, handleAudioData, createRecorderWindow };
