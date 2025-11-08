import { glob } from 'glob';
import { readFile } from 'node:fs/promises';

const DOT_NOTATION_REGEX = /process\.env(?:\?\.)?\.([A-Z0-9_]+)/g;
const BRACKET_NOTATION_REGEX = /process\.env(?:\?\.)?\[\s*['"`]([A-Z0-9_]+)['"`]\s*\]/g;

export async function scanForEnvVariables(includeGlobs, ignoreGlobs) {
  const files = await glob(includeGlobs, { ignore: ignoreGlobs, nodir: true });
  const foundVariables = new Set();

  await Promise.all(
    files.map(async (filePath) => {
      try {
        const content = await readFile(filePath, 'utf8');
        for (const match of content.matchAll(DOT_NOTATION_REGEX)) {
          const varName = match[1];
          if (varName) foundVariables.add(varName);
        }
        for (const match of content.matchAll(BRACKET_NOTATION_REGEX)) {
          const varName = match[1];
          if (varName) foundVariables.add(varName);
        }
      } catch {
        // ignore unreadable files
      }
    })
  );

  return foundVariables;
}


