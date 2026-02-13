#!/usr/bin/env sh
set -eu

APP_NAME_PATTERN="Packman_"

echo "Checking for stale mounted DMGs..."

DEVICES=$(hdiutil info | awk '
  /^\/dev\// { dev=$1 }
  /rw\.[0-9]+\..*\.dmg/ && $0 ~ /Packman_/ { print dev }
' | sort -u)

if [ -n "${DEVICES}" ]; then
  for dev in ${DEVICES}; do
    echo "Detaching stale device: ${dev}"
    hdiutil detach "${dev}" || hdiutil detach -force "${dev}" || true
  done
else
  echo "No stale mounted DMGs found."
fi

echo "Cleaning stale intermediate DMG files..."
rm -f ./src-tauri/target/release/bundle/dmg/rw.*."${APP_NAME_PATTERN}"*.dmg 2>/dev/null || true
rm -f ./src-tauri/target/release/bundle/macos/rw.*."${APP_NAME_PATTERN}"*.dmg 2>/dev/null || true

echo "DMG cleanup complete."
