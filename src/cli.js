import { Command } from 'commander';
import chalk from 'chalk';
import { createRequire } from 'module';
import { runCheck } from './commands/check.js';
import { runGenerate } from './commands/generate.js';
import { runSync } from './commands/sync.js';

const require = createRequire(import.meta.url);
const pkg = (() => {
  try {
    return require('../package.json');
  } catch {
    return { version: '0.0.0' };
  }
})();

const program = new Command();
program
  .name('checkmyenv')
  .description('Scan project for process.env variables, compare with .env, and sync with .env.example')
  .version(pkg.version);

program
  .command('check')
  .description('Scan project and show report of missing, extra, and unused env vars')
  .option('-p, --patterns <globs...>', 'Glob patterns to include', ['**/*.{js,jsx,ts,tsx,mjs,cjs,vue,svelte}'])
  .option('-i, --ignore <globs...>', 'Glob patterns to ignore', ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'])
  .option('-e, --env-file <path>', 'Path to .env file', '.env')
  .action(async (options) => {
    await runCheck(options);
  });

program
  .command('generate')
  .description('Create/update .env file with interactive prompts for missing values')
  .option('-p, --patterns <globs...>', 'Glob patterns to include', ['**/*.{js,jsx,ts,tsx,mjs,cjs,vue,svelte}'])
  .option('-i, --ignore <globs...>', 'Glob patterns to ignore', ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'])
  .option('-e, --env-file <path>', 'Path to .env file', '.env')
  .action(async (options) => {
    await runGenerate(options);
  });

program
  .command('sync')
  .description('Merge .env with .env.example; prompt for any missing values')
  .option('-e, --env-file <path>', 'Path to .env file', '.env')
  .option('-x, --example-file <path>', 'Path to .env.example file', '.env.example')
  .action(async (options) => {
    await runSync(options);
  });

program.showHelpAfterError(chalk.red('\nError:'));
program.parseAsync(process.argv);


