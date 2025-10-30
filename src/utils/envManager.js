import { existsSync } from 'node:fs';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

export function loadEnvFile(envPath) {
  const fullPath = resolve(process.cwd(), envPath);
  if (!existsSync(fullPath)) {
    return { path: fullPath, vars: new Map() };
  }
  const content = readFileSync(fullPath, 'utf8');
  const parsed = dotenv.parse(content);
  return { path: fullPath, vars: new Map(Object.entries(parsed)) };
}

export function saveEnvFile(envPath, varsMap) {
  const fullPath = resolve(process.cwd(), envPath);
  const lines = [];
  for (const [key, value] of [...varsMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const sanitized = String(value ?? '');
    const needsQuotes = /\s|#|"|\'/.test(sanitized);
    const serialized = needsQuotes ? JSON.stringify(sanitized) : sanitized;
    lines.push(`${key}=${serialized}`);
  }
  const content = lines.join('\n') + (lines.length ? '\n' : '');
  writeFileSync(fullPath, content, 'utf8');
  return fullPath;
}

export function computeDiff(usedVarNames, envVarsMap) {
  const used = new Set(usedVarNames);
  const envKeys = new Set(envVarsMap.keys());

  const missing = [...used].filter((k) => !envKeys.has(k)).sort();
  const unused = [...envKeys].filter((k) => !used.has(k)).sort();
  const present = [...used].filter((k) => envKeys.has(k)).sort();

  return { missing, unused, present };
}

export function loadExample(examplePath) {
  const { vars } = loadEnvFile(examplePath);
  return vars;
}

export function mergeWithExample(exampleVars, envVars) {
  const merged = new Map(envVars);
  for (const [key, value] of exampleVars.entries()) {
    if (!merged.has(key)) {
      merged.set(key, value ?? '');
    }
  }
  return merged;
}


