"""
音效模組
錄音開始/結束時播放提示音
使用 winsound.Beep，在背景執行緒播放避免阻塞
"""

import logging
import threading

import winsound

logger = logging.getLogger("tywan.Sounds")


def _beep(freq: int, duration_ms: int):
    """在背景執行緒播放 beep"""
    try:
        winsound.Beep(freq, duration_ms)
    except Exception as e:
        logger.debug("Beep failed: %s", e)


def play_start():
    """錄音開始：柔和上升音 (500Hz, 120ms)"""
    threading.Thread(target=_beep, args=(500, 120), daemon=True).start()


def play_stop():
    """錄音結束：柔和下降音 (350Hz, 120ms)"""
    threading.Thread(target=_beep, args=(350, 120), daemon=True).start()
