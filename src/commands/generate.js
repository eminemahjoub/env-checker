import inquirer from 'inquirer';
import chalk from 'chalk';
import { scanForEnvVariables } from '../utils/fileScanner.js';
import { loadEnvFile, computeDiff, saveEnvFile } from '../utils/envManager.js';

export async function runGenerate(options) {
  const include = options.patterns || ['**/*.{js,jsx,ts,tsx,mjs,cjs,vue,svelte}'];
  const ignore = options.ignore || ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'];
  const envFile = options.envFile || '.env';

  const used = await scanForEnvVariables(include, ignore);
  const { vars, path } = loadEnvFile(envFile);
  const diff = computeDiff(used, vars);

  const newVars = new Map(vars);

  if (diff.missing.length === 0) {
    console.log(chalk.green(`No missing variables. ${envFile} is up to date.`));
  } else {
    console.log(chalk.yellow(`Found ${diff.missing.length} missing variables. Let's fill them in.`));
    const answers = await inquirer.prompt(
      diff.missing.map((key) => ({
        type: 'input',
        name: key,
        message: `Value for ${key}:`,
        default: ''
      }))
    );
    for (const key of diff.missing) {
      newVars.set(key, answers[key] ?? '');
    }
  }

  const savedPath = saveEnvFile(envFile, newVars);
  console.log(chalk.cyan(`Saved ${savedPath}`));

  if (diff.unused.length > 0) {
    console.log(chalk.gray(`Note: ${diff.unused.length} variables in ${envFile} are not referenced in code.`));
  }
}


