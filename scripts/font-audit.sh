#!/usr/bin/env bash
# Font hygiene audit — run before committing to catch font regressions.
# Usage: bash scripts/font-audit.sh
set -e
cd "$(dirname "$0")/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RESET='\033[0m'

fail=0

echo "=== Font hygiene audit ==="
echo ""

# 1. Original site uses --font-serif (Source Serif 4), not Fraunces
echo "[1/5] Original uses --font-serif (not Fraunces)?"
if grep -q 'var(--font-serif)' src/app/globals.css; then
  echo -e "${GREEN}  OK${RESET} — Original h1-h6 uses --font-serif"
else
  echo -e "${RED}  FAIL${RESET} — Original h1-h6 not bound to --font-serif"
  fail=1
fi

# 2. Fraunces only used inside .claude-root scope
echo "[2/5] Fraunces scoped to Claude variant only?"
stray=$(grep -rnE 'var\(--font-fraunces' src/ 2>/dev/null | grep -v "variants.css" | grep -v "claude/" | grep -v "layout.tsx" || true)
if [ -z "$stray" ]; then
  echo -e "${GREEN}  OK${RESET} — no stray Fraunces refs outside Claude scope"
else
  echo -e "${RED}  FAIL${RESET} — Fraunces leaked outside Claude:"
  echo "$stray"
  fail=1
fi

# 3. font-optical-sizing: auto
echo "[3/5] font-optical-sizing: auto set?"
if grep -rq 'font-optical-sizing: auto' src/app/globals.css; then
  echo -e "${GREEN}  OK${RESET}"
else
  echo -e "${YELLOW}  WARN${RESET} — opsz axis not auto-driven"
fi

# 4. Bare generic font-family without variable fallback
echo "[4/5] Bare generic font-family without variable fallback?"
bad=$(grep -rnE 'font-family:\s*(serif|sans-serif|monospace)\s*;' src/ 2>/dev/null | grep -v node_modules || true)
if [ -z "$bad" ]; then
  echo -e "${GREEN}  OK${RESET}"
else
  echo -e "${RED}  FAIL${RESET} — found bare generic font-family:"
  echo "$bad"
  fail=1
fi

# 5. Every --font-* variable referenced is declared in layout.tsx
echo "[5/5] Every --font-* variable declared in layout.tsx?"
declared=$(grep -oE -- 'variable:\s*"--font-[a-z0-9-]+"' src/app/layout.tsx | grep -oE -- '--font-[a-z0-9-]+' | sort -u)
used=$(grep -rhoE -- 'var\(--font-[a-z0-9-]+' src/ 2>/dev/null | grep -oE -- '--font-[a-z0-9-]+' | sort -u)
missing=$(comm -13 <(echo "$declared") <(echo "$used") || true)
if [ -z "$missing" ]; then
  echo -e "${GREEN}  OK${RESET}"
else
  echo -e "${RED}  FAIL${RESET} — referenced but not loaded:"
  echo "$missing"
  fail=1
fi

echo ""
if [ "$fail" = "1" ]; then
  echo -e "${RED}✗ Font audit FAILED${RESET}"
  exit 1
else
  echo -e "${GREEN}✓ Font audit PASSED${RESET}"
fi
