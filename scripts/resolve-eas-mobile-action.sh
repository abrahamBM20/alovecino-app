#!/usr/bin/env bash
set -euo pipefail

environment="dev"
requested_action="auto"
base_ref=""
head_ref="HEAD"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --environment)
      environment="$2"
      shift 2
      ;;
    --requested-action)
      requested_action="$2"
      shift 2
      ;;
    --base-ref)
      base_ref="$2"
      shift 2
      ;;
    --head-ref)
      head_ref="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

case "$environment" in
  dev)
    update_branch="development"
    default_build_profile="dev-preview"
    ;;
  qa)
    update_branch="qa"
    default_build_profile="qa"
    ;;
  prod)
    update_branch="production"
    default_build_profile="prod-preview"
    ;;
  *)
    echo "Unsupported environment: $environment" >&2
    exit 2
    ;;
esac

emit() {
  local action="$1"
  local build_profile="$2"
  local reason="$3"

  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    {
      echo "action=$action"
      echo "build_profile=$build_profile"
      echo "update_branch=$update_branch"
      echo "reason=$reason"
    } >> "$GITHUB_OUTPUT"
  else
    echo "action=$action"
    echo "build_profile=$build_profile"
    echo "update_branch=$update_branch"
    echo "reason=$reason"
  fi

  echo "Resolved EAS mobile action: action=$action build_profile=$build_profile update_branch=$update_branch reason=$reason"
}

case "$requested_action" in
  none)
    emit "none" "" "manual-none"
    exit 0
    ;;
  update)
    emit "update" "" "manual-update"
    exit 0
    ;;
  apk)
    emit "build" "$default_build_profile" "manual-apk"
    exit 0
    ;;
  store)
    if [ "$environment" != "prod" ]; then
      echo "The store action is only valid for prod." >&2
      exit 2
    fi

    emit "build" "prod" "manual-store"
    exit 0
    ;;
  auto)
    ;;
  *)
    echo "Unsupported requested action: $requested_action" >&2
    exit 2
    ;;
esac

if [ -z "$base_ref" ]; then
  if [ "${GITHUB_EVENT_NAME:-}" = "pull_request" ] && [ -n "${GITHUB_BASE_REF:-}" ]; then
    base_ref="origin/${GITHUB_BASE_REF}"
  elif [ -n "${GITHUB_EVENT_BEFORE:-}" ] && ! [[ "$GITHUB_EVENT_BEFORE" =~ ^0+$ ]]; then
    base_ref="$GITHUB_EVENT_BEFORE"
  elif git rev-parse HEAD^ >/dev/null 2>&1; then
    base_ref="HEAD^"
  fi
fi

if [ -z "$base_ref" ]; then
  emit "none" "" "no-base-ref"
  exit 0
fi

changed_files="$(git diff --name-only "$base_ref" "$head_ref" || true)"

if [ -z "$changed_files" ]; then
  emit "none" "" "no-changed-files"
  exit 0
fi

frontend_changed="$(printf '%s\n' "$changed_files" | grep -E '^frontend/' || true)"

if [ -z "$frontend_changed" ]; then
  emit "none" "" "no-frontend-changes"
  exit 0
fi

native_patterns='^frontend/(app\.config\.js|app\.json|eas\.json|package\.json|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|android/|ios/|plugins/|assets/(app-icon|adaptive-icon|adaptive-icon-foreground|splash-icon|icon)\.(png|jpg|jpeg|webp))'
native_changed="$(printf '%s\n' "$changed_files" | grep -E "$native_patterns" || true)"

if [ -n "$native_changed" ]; then
  emit "build" "$default_build_profile" "native-runtime-change"
else
  emit "update" "" "js-or-compatible-assets-change"
fi
