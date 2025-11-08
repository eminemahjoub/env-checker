import { Command } from 'commander';
import chalk from 'chalk';
import { createRequire } from 'module';
import { runCheck } from './commands/check.js';
import { runGenerate } from './commands/generate.js';
import { runSync } from './commands/sync.js';
import { runQuickInit } from './commands/quick.js';

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
  .option('-p, --patterns <globs...>', 'Glob patterns to include')
  .option('-i, --ignore <globs...>', 'Glob patterns to ignore')
  .option('-e, --env-file <path>', 'Path to .env file')
  .option('-r, --report <format>', 'Report format (console|json)')
  .action(async (options) => {
    await runCheck(options);
  });

program
  .command('generate')
  .description('Create/update .env file with interactive prompts for missing values')
  .option('-p, --patterns <globs...>', 'Glob patterns to include')
  .option('-i, --ignore <globs...>', 'Glob patterns to ignore')
  .option('-e, --env-file <path>', 'Path to .env file')
  .action(async (options) => {
    await runGenerate(options);
  });

program
  .command('sync')
  .description('Merge .env with .env.example; prompt for any missing values')
  .option('-e, --env-file <path>', 'Path to .env file')
  .option('-x, --example-file <path>', 'Path to .env.example file')
  .action(async (options) => {
    await runSync(options);
  });

// Shorthand: positional keys to create/update in .env via prompts
program
  .option('-e, --env-file <path>', 'Path to .env file')
  .argument('[keys...]', 'Env variable keys to ensure in .env')
  .action(async (keys, opts) => {
    if (Array.isArray(keys) && keys.length > 0) {
      await runQuickInit(opts, keys);
    } else {
      program.outputHelp();
    }
  });

program.showHelpAfterError(chalk.red('\nError:'));
program.parseAsync(process.argv);


