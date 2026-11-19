# Quellen der Reels

Jedes Reel ist eine HTML-Seite (1080 × 1920) mit einer Zeitleiste `render(t)`.
`render.js` steuert Chromium (Playwright), nimmt jedes Bild auf und kodiert es mit FFmpeg.

```bash
node render.js 01-kostenrisiko.html ../01-kostenrisiko.mp4 30
# Vorschaubilder zu bestimmten Sekunden:
node render.js 01-kostenrisiko.html --stills vorschau 2.8,9.5
```

Texte ändern: direkt im HTML. Zeiten der Szenen: Konstanten `W1`, `W2`, `W3` im Skript-Teil.
Fotos: Unsplash (Symbolbilder), 3D-Icons: Microsoft Fluent Emoji (MIT), Schriften: Geist, Instrument Serif, Caveat (OFL).
