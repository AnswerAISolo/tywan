"""
系統列圖標產生器
依應用程式狀態產生不同顏色的圖標
"""

from PIL import Image, ImageDraw

# 狀態 → 背景顏色
STATE_COLORS = {
    "idle": (76, 175, 80),       # 綠色 — 待機
    "recording": (244, 67, 54),  # 紅色 — 錄音中
    "processing": (255, 152, 0), # 橘色 — 處理中
    "error": (158, 158, 158),    # 灰色 — 錯誤
}


def create_tray_icon(state: str = "idle", size: int = 64) -> Image.Image:
    """依狀態產生系統列圖標（麥克風圖案 + 狀態色背景）"""
    color = STATE_COLORS.get(state, STATE_COLORS["idle"])

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = size // 16
    # 圓形背景
    draw.ellipse([pad, pad, size - pad, size - pad], fill=color)

    # 白色麥克風
    white = (255, 255, 255)
    # 麥克風頭（橢圓）
    draw.ellipse(
        [size * 22 // 64, size * 14 // 64, size * 42 // 64, size * 38 // 64],
        fill=white,
    )
    # 麥克風柄（矩形）
    draw.rectangle(
        [size * 28 // 64, size * 38 // 64, size * 36 // 64, size * 48 // 64],
        fill=white,
    )
    # 麥克風底座（線）
    draw.line(
        [size * 22 // 64, size * 48 // 64, size * 42 // 64, size * 48 // 64],
        fill=white,
        width=max(1, size // 20),
    )

    return img
