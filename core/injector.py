"""
文字注入模組
將修飾後的文字注入到當前游標位置

使用剪貼簿 + Ctrl+V 方式，相容所有應用程式（Chrome、Firefox、桌面應用）
"""

import time
import logging

import pyperclip
import pyautogui

logger = logging.getLogger("tywan.Injector")

CLIPBOARD_SETTLE_SECONDS = 0.1


class TextInjector:
    """文字注入引擎"""

    def __init__(self, settings):
        self.settings = settings

    def inject(self, text: str):
        """將文字注入到當前游標位置（剪貼簿 + Ctrl+V）"""
        if not text:
            return

        try:
            pyperclip.copy(text)
            time.sleep(CLIPBOARD_SETTLE_SECONDS)
            pyautogui.hotkey("ctrl", "v")
            logger.info("Injected %d characters via clipboard", len(text))
        except Exception as e:
            logger.error("Text injection failed: %s", e)
            raise
