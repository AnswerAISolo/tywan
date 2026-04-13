"""
音訊錄製模組
使用 sounddevice 進行即時錄音，支援 Push-to-Talk
"""

import numpy as np
import sounddevice as sd
import logging
import threading
import io
import wave

logger = logging.getLogger("tywan.Recorder")

# 錄音參數
SAMPLE_RATE = 16000  # Whisper 推薦 16kHz
CHANNELS = 1
DTYPE = "int16"


class AudioRecorder:
    """Push-to-Talk 錄音器"""

    def __init__(self):
        self._chunks: list[np.ndarray] = []
        self._stream = None
        self._lock = threading.Lock()

    def start(self):
        """開始錄音"""
        with self._lock:
            self._chunks = []
            self._stream = sd.InputStream(
                samplerate=SAMPLE_RATE,
                channels=CHANNELS,
                dtype=DTYPE,
                blocksize=1024,
                callback=self._callback,
            )
            self._stream.start()

    def stop(self) -> np.ndarray:
        """停止錄音，回傳音訊 numpy array (int16, 16kHz, mono)"""
        with self._lock:
            if self._stream:
                self._stream.stop()
                self._stream.close()
                self._stream = None

            if not self._chunks:
                return np.array([], dtype=np.int16)

            audio = np.concatenate(self._chunks, axis=0).flatten()
            self._chunks = []
            return audio

    def _callback(self, indata, frames, time_info, status):
        """sounddevice 回呼：收集音訊片段"""
        if status:
            logger.warning("錄音狀態: %s", status)
        self._chunks.append(indata.copy())

    @property
    def is_recording(self) -> bool:
        return self._stream is not None and self._stream.active


def audio_to_wav_bytes(audio: np.ndarray, sample_rate: int = SAMPLE_RATE) -> bytes:
    """將 numpy int16 音訊轉為 WAV bytes（供 API 上傳用）"""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(2)  # int16 = 2 bytes
        wf.setframerate(sample_rate)
        wf.writeframes(audio.tobytes())
    return buf.getvalue()
