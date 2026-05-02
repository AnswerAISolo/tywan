const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('recorderBridge', {
  onStartRecording: (callback) => {
    ipcRenderer.on('start-recording', () => callback());
  },
  onStopRecording: (callback) => {
    ipcRenderer.on('stop-recording', () => callback());
  },
  onCancelRecording: (callback) => {
    ipcRenderer.on('cancel-recording', () => callback());
  },
  sendAudioData: (buffer) => {
    ipcRenderer.send('audio-data', buffer);
  },
});
