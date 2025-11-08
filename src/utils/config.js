import { existsSync, readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const CONFIG_FILES = [
  'checkmyenv.config.js',
  'checkmyenv.config.mjs',
  'checkmyenv.config.cjs',
  'checkmyenv.config.json'
];

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

async function loadFileConfig(cwd) {
  for (const filename of CONFIG_FILES) {
    const fullPath = resolve(cwd, filename);
    if (!existsSync(fullPath)) continue;
    const ext = extname(fullPath);
    if (ext === '.json') {
      const raw = readFileSync(fullPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (isObject(parsed)) return parsed;
      return {};
    }
    if (ext === '.cjs') {
      const { createRequire } = await import('node:module');
      const require = createRequire(import.meta.url);
      const required = require(fullPath);
      if (isObject(required)) return required;
      if (required && isObject(required.default)) return required.default;
      return {};
    }
    const moduleUrl = pathToFileURL(fullPath).href;
    const imported = await import(moduleUrl);
    if (imported && isObject(imported.default)) {
      return imported.default;
    }
  }
  return null;
}

function loadPackageConfig(cwd) {
  const packagePath = resolve(cwd, 'package.json');
  if (!existsSync(packagePath)) return null;
  try {
    const raw = readFileSync(packagePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (isObject(parsed.checkmyenv)) {
      return parsed.checkmyenv;
    }
  } catch {
    // ignore malformed package.json
  }
  return null;
}

export async function loadConfig() {
  const cwd = process.cwd();
  const fileConfig = await loadFileConfig(cwd);
  const pkgConfig = loadPackageConfig(cwd);
  return {
    ...(isObject(fileConfig) ? fileConfig : {}),
    ...(isObject(pkgConfig) ? pkgConfig : {})
  };
}


