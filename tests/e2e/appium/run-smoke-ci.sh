#!/usr/bin/env bash
set -euo pipefail

mkdir -p qa-evidence

adb devices -l | tee qa-evidence/adb-devices.txt

for attempt in $(seq 1 60); do
  if adb shell service check settings 2>/dev/null | grep -q "found"; then
    echo "Android settings service is ready."
    break
  fi

  if [ "$attempt" -eq 60 ]; then
    echo "Android settings service did not become ready." >&2
    exit 1
  fi

  echo "Waiting for Android settings service (${attempt}/60)"
  sleep 2
done

adb shell settings put global window_animation_scale 0 || true
adb shell settings put global transition_animation_scale 0 || true
adb shell settings put global animator_duration_scale 0 || true

appium --base-path / --log-level info > qa-evidence/appium.log 2>&1 &
appium_pid="$!"

cleanup() {
  if kill -0 "$appium_pid" >/dev/null 2>&1; then
    kill "$appium_pid" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

for attempt in $(seq 1 60); do
  if curl --silent --fail http://127.0.0.1:4723/status > qa-evidence/appium-status.json; then
    echo "Appium is ready."
    node tests/e2e/appium/alovecino-smoke.test.js
    exit 0
  fi

  echo "Waiting for Appium (${attempt}/60)"
  sleep 2
done

echo "Appium server did not become ready." >&2
exit 1
