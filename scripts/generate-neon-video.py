"""Render an original, silent, seamless abstract neon loop (no source footage).
Requires numpy, Pillow and ffmpeg. This is an offline asset-generation command.
"""
from pathlib import Path
import subprocess
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
out = root / 'public/video'
out.mkdir(parents=True, exist_ok=True)
width, height, fps, duration = 1280, 720, 24, 8
x, y = np.meshgrid(np.linspace(0, 1, 640), np.linspace(0, 1, 360))
encoder = subprocess.Popen(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', f'{width}x{height}', '-framerate', str(fps), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(out/'neon-abstract.mp4')], stdin=subprocess.PIPE)
for frame in range(fps * duration):
    phase = frame / (fps * duration) * 2 * np.pi
    rgb = np.zeros((360, 640, 3), dtype=np.float64) + [10, 8, 21]
    for offset, color, shift in [(.12, [155, 5, 135], 0), (.57, [12, 130, 144], 2.0), (.86, [115, 18, 133], 4.0)]:
        curve = offset + .16 * np.sin(x*4.8 + phase + shift) + .27*(x-.5)
        distance = abs(y-curve)
        glow = np.exp(-distance*distance/.006)
        core = np.exp(-distance*distance/.000028)
        rgb += (glow*.43+core*.8)[:,:,None] * np.array(color)
    rgb *= (.72 + .28 * abs(x-.5)*2)[:,:,None]
    im = Image.fromarray(np.uint8(np.clip(rgb,0,255))).resize((width,height),Image.Resampling.BICUBIC)
    if frame == 0: im.save(out/'neon-poster.webp',quality=85)
    encoder.stdin.write(im.tobytes())
encoder.stdin.close()
if encoder.wait(): raise SystemExit('Video encoder failed')
print('Generated original 8-second abstract loop and poster.')
