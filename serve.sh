#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# serve.sh  –  Start a local dev server for Maya's portfolio
# ──────────────────────────────────────────────────────────────
PORT=8000
URL="http://localhost:$PORT"

echo ""
echo "  ╔═══════════════════════════════════════╗"
echo "  ║   Maya — Product Designer Portfolio   ║"
echo "  ╠═══════════════════════════════════════╣"
echo "  ║   Serving on $URL         ║"
echo "  ╚═══════════════════════════════════════╝"
echo ""

# Open in default browser (cross-platform)
if command -v xdg-open &>/dev/null; then
  xdg-open "$URL" &
elif command -v open &>/dev/null; then
  open "$URL" &
elif command -v start &>/dev/null; then
  start "$URL" &
fi

# Serve via Python 3
python3 -m http.server "$PORT" 2>/dev/null || python -m http.server "$PORT"
