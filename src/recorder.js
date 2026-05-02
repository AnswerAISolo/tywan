const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let overlayWindow = null;
let tempAudioPath = null;

// 建立錄音浮動視窗
function createOverlay() {
  if (overlayWindow) return overlayWindow;

  overlayWindow = new BrowserWindow({
    width: 200,
    height: 60,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'overlay-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));
  overlayWindow.setIgnoreMouseEvents(true);

  // 置於螢幕右下角（系統匣附近）
  const { screen } = require('electron');
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;
  overlayWindow.setPosition(width - 220, height - 80);

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

function showOverlay(status) {
  const win = createOverlay();
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status', status);
    win.show();
  }
}

function hideOverlay() {
  if (overlayWindow) {
    overlayWindow.hide();
  }
}

// 取得暫存音訊路徑
function getTempAudioPath() {
  if (!tempAudioPath) {
    tempAudioPath = path.join(os.tmpdir(), 'notype-recording.webm');
  }
  return tempAudioPath;
}

// 儲存音訊資料到暫存檔
function saveAudioBuffer(buffer) {
  const filePath = getTempAudioPath();
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
}

// 清理暫存檔
function cleanupTempAudio() {
  const filePath = getTempAudioPath();
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  createOverlay,
  showOverlay,
  hideOverlay,
  getTempAudioPath,
  saveAudioBuffer,
  cleanupTempAudio,
};
