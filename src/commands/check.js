import chalk from 'chalk';
import { scanForEnvVariables } from '../utils/fileScanner.js';
import { loadEnvFile, computeDiff } from '../utils/envManager.js';

export async function runCheck(options) {
  const include = options.patterns || ['**/*.{js,jsx,ts,tsx,mjs,cjs,vue,svelte}'];
  const ignore = options.ignore || ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'];
  const envFile = options.envFile || '.env';

  const used = await scanForEnvVariables(include, ignore);
  const { vars } = loadEnvFile(envFile);
  const diff = computeDiff(used, vars);

  const totalUsed = [...used].length;
  console.log(chalk.cyan(`Scanned variables used in code: ${totalUsed}`));
  console.log();

  if (diff.missing.length === 0 && diff.unused.length === 0) {
    console.log(chalk.green('All good! .env matches variables used in code.'));
    return;
  }

  if (diff.missing.length > 0) {
    console.log(chalk.yellow('Missing in .env (used in code but not set):'));
    for (const key of diff.missing) {
      console.log(`  ${chalk.yellow('•')} ${key}`);
    }
    console.log();
  }

  if (diff.unused.length > 0) {
    console.log(chalk.gray('Unused in code (present in .env but not referenced):'));
    for (const key of diff.unused) {
      console.log(`  ${chalk.gray('•')} ${key}`);
    }
    console.log();
  }
}


