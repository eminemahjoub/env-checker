import { scanForEnvVariables } from '../utils/fileScanner.js';
import { loadEnvFile, computeDiff } from '../utils/envManager.js';
import {
  DEFAULT_INCLUDE_PATTERNS,
  DEFAULT_IGNORE_PATTERNS,
  DEFAULT_ENV_FILE,
  DEFAULT_REPORT_FORMAT
} from '../utils/constants.js';
import { loadConfig } from '../utils/config.js';
import { outputReport } from '../utils/reporters.js';

function normaliseArray(value) {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  return [value];
}

export async function runCheck(options) {
  const config = await loadConfig();

  const include =
    normaliseArray(options.patterns) ??
    normaliseArray(config?.patterns) ??
    DEFAULT_INCLUDE_PATTERNS;
  const ignore =
    normaliseArray(options.ignore) ??
    normaliseArray(config?.ignore) ??
    DEFAULT_IGNORE_PATTERNS;
  const envFile = options.envFile ?? config?.envFile ?? DEFAULT_ENV_FILE;
  const reportFormat = options.report ?? config?.report ?? DEFAULT_REPORT_FORMAT;
  const additionalKeys = normaliseArray(config?.additionalKeys) ?? [];

  const used = await scanForEnvVariables(include, ignore);
  additionalKeys.forEach((key) => {
    if (typeof key === 'string' && key.trim()) {
      used.add(key.trim());
    }
  });

  const { vars } = loadEnvFile(envFile);
  const diff = computeDiff(used, vars);

  outputReport(reportFormat, diff, {
    usedCount: used.size,
    envFile
  });
}

