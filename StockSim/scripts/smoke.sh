#!/usr/bin/env bash
# Runs the StockSim smoke test with agent-device.
#
# Locally: boot the iOS Simulator and run `npm run smoke`.
# Cloud:   run `native-sim up --agent --framework react-native --project-dir StockSim`,
#          then run the `agent-device connect proxy ...` command it prints, then `npm run smoke`.
#
# Any extra arguments are passed to `agent-device test`.

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v agent-device >/dev/null 2>&1; then
  echo "agent-device is not installed. Install it with: npm install -g agent-device" >&2
  exit 1
fi

mkdir -p e2e/reports

agent-device test e2e/smoke.ad \
  --reporter default \
  --reporter junit:e2e/reports/smoke-junit.xml \
  --artifacts-dir e2e/reports/artifacts \
  "$@"
