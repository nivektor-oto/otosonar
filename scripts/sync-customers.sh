#!/usr/bin/env bash
# Nightly sync: pulls all OtoSonar customers to a local file on the founder desktop.
# Runs under user's crontab.
set -euo pipefail

DESKTOP="/home/aller/Desktop"
OUT="$DESKTOP/otosonar-musteriler.csv"
LOG="$DESKTOP/otosonar-musteriler-sync.log"

FOUNDER_EMAIL="kurucu@otosonar.com"
FOUNDER_PASSWORD="OtoSonar2026Kurucu"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# Login → capture cookie
curl -s -c "$TMP/cookies" -X POST "https://otosonar.com/api/founder/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$FOUNDER_EMAIL\",\"password\":\"$FOUNDER_PASSWORD\"}" > "$TMP/login.json"

if ! grep -q '"success":true' "$TMP/login.json"; then
  echo "[$(date)] LOGIN FAILED: $(cat "$TMP/login.json")" >> "$LOG"
  exit 1
fi

# Pull CSV
curl -s -b "$TMP/cookies" "https://otosonar.com/api/founder/users-csv" -o "$OUT.new"

if [ -s "$OUT.new" ] && head -1 "$OUT.new" | grep -q "customerNumber"; then
  mv "$OUT.new" "$OUT"
  chmod 600 "$OUT"
  LINES=$(wc -l < "$OUT")
  echo "[$(date)] sync OK — $LINES lines (headers+data)" >> "$LOG"
else
  echo "[$(date)] SYNC FAILED: invalid response" >> "$LOG"
  exit 2
fi
