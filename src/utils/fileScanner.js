import { glob } from 'glob';
import { readFile } from 'node:fs/promises';

const PROCESS_ENV_REGEX = /process\.env\.([A-Z0-9_]+)/g;

export async function scanForEnvVariables(includeGlobs, ignoreGlobs) {
  const files = await glob(includeGlobs, { ignore: ignoreGlobs, nodir: true });
  const foundVariables = new Set();

  await Promise.all(
    files.map(async (filePath) => {
      try {
        const content = await readFile(filePath, 'utf8');
        for (const match of content.matchAll(PROCESS_ENV_REGEX)) {
          const varName = match[1];
          if (varName) {
            foundVariables.add(varName);
          }
        }
      } catch {
        // ignore unreadable files
      }
    })
  );

  return foundVariables;
}


