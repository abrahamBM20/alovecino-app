import fs from 'node:fs';
import path from 'node:path';

const evidenceDir = process.env.QA_EVIDENCE_DIR || 'qa-evidence';

function readText(fileName, fallback = '') {
  try {
    return fs.readFileSync(path.join(evidenceDir, fileName), 'utf8').trim();
  } catch (_error) {
    return fallback;
  }
}

function readJson(fileName) {
  try {
    return JSON.parse(fs.readFileSync(path.join(evidenceDir, fileName), 'utf8'));
  } catch (_error) {
    return null;
  }
}

function normalizeExitCode(value) {
  const parsed = Number.parseInt(String(value || '1').trim(), 10);
  return Number.isFinite(parsed) ? parsed : 1;
}

function summarizeNewman(report) {
  if (!report?.run) {
    return {
      executions: 0,
      assertions: 0,
      failedAssertions: 0,
      failures: ['newman-report.json no fue generado o no es valido.'],
    };
  }

  const executions = report.run.executions || [];
  const failures = (report.run.failures || []).map((failure) => {
    const source = failure.source?.name || failure.parent?.name || 'request desconocido';
    const message = failure.error?.message || failure.error?.name || 'falla sin mensaje';
    const test = failure.error?.test ? ` (${failure.error.test})` : '';

    return `${source}${test}: ${message}`;
  });

  return {
    executions: executions.length,
    assertions: report.run.stats?.assertions?.total ?? 0,
    failedAssertions: report.run.stats?.assertions?.failed ?? failures.length,
    failures,
  };
}

function summarizeK6(summary) {
  const metrics = summary?.metrics || {};

  return {
    checksRate: metrics.checks?.rate ?? metrics.checks?.value,
    httpReqFailedRate: metrics.http_req_failed?.rate ?? metrics.http_req_failed?.value,
    httpReqDurationP95:
      metrics.http_req_duration?.percentiles?.['p(95)'] ?? metrics.http_req_duration?.['p(95)'],
  };
}

const newmanExit = normalizeExitCode(readText('newman-exit-code.txt', '1'));
const k6Exit = normalizeExitCode(readText('k6-exit-code.txt', '1'));
const newman = summarizeNewman(readJson('newman-report.json'));
const k6 = summarizeK6(readJson('k6-summary.json'));
const failed = newmanExit !== 0 || k6Exit !== 0;

const lines = [
  `status=${failed ? 'failed' : 'passed'}`,
  `newman_exit_code=${newmanExit}`,
  `newman_executions=${newman.executions}`,
  `newman_assertions=${newman.assertions}`,
  `newman_failed_assertions=${newman.failedAssertions}`,
  `k6_exit_code=${k6Exit}`,
  `k6_checks_rate=${k6.checksRate ?? 'n/a'}`,
  `k6_http_req_failed_rate=${k6.httpReqFailedRate ?? 'n/a'}`,
  `k6_http_req_duration_p95_ms=${k6.httpReqDurationP95 ?? 'n/a'}`,
];

if (newman.failures.length > 0) {
  lines.push('newman_failures:');
  newman.failures.slice(0, 20).forEach((failure) => {
    lines.push(`- ${failure}`);
  });
}

fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(path.join(evidenceDir, 'api-k6-result.txt'), `${lines.join('\n')}\n`);

if (failed) {
  console.error(lines.join('\n'));
  process.exit(1);
}

console.log(lines.join('\n'));
