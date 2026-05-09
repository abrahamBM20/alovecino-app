#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${SONAR_POSTGRES_URL:-}" && -z "${SONAR_JDBC_URL:-}" ]]; then
  export SONAR_JDBC_URL="${SONAR_POSTGRES_URL/postgresql:\/\//jdbc:postgresql://}"
fi

exec /opt/sonarqube/docker/entrypoint.sh
