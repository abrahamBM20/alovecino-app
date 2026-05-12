#!/usr/bin/env bash
set -euo pipefail

mkdir -p qa-evidence

adb devices -l | tee qa-evidence/adb-devices.txt

ready_checks=0
for attempt in $(seq 1 90); do
  if adb shell service check settings 2>/dev/null | grep -q "found" \
    && adb shell service check package 2>/dev/null | grep -q "found" \
    && adb shell cmd package list packages --show-versioncode >/dev/null 2>&1 \
    && adb shell pm path android >/dev/null 2>&1; then
    ready_checks=$((ready_checks + 1))
    echo "Android framework readiness check ${ready_checks}/3 passed."
  else
    ready_checks=0
    echo "Waiting for Android framework services (${attempt}/90)"
  fi

  if [ "$ready_checks" -ge 3 ]; then
    echo "Android framework services are ready."
    break
  fi

  if [ "$attempt" -eq 90 ]; then
    echo "Android framework services did not become ready." >&2
    exit 1
  fi

  sleep 2
done

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
