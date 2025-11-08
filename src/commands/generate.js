import inquirer from 'inquirer';
import chalk from 'chalk';
import { scanForEnvVariables } from '../utils/fileScanner.js';
import { loadEnvFile, computeDiff, saveEnvFile } from '../utils/envManager.js';
import {
  DEFAULT_INCLUDE_PATTERNS,
  DEFAULT_IGNORE_PATTERNS,
  DEFAULT_ENV_FILE
} from '../utils/constants.js';
import { loadConfig } from '../utils/config.js';

function normaliseArray(value) {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  return [value];
}

export async function runGenerate(options) {
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
  const additionalKeys = normaliseArray(config?.additionalKeys) ?? [];

  const used = await scanForEnvVariables(include, ignore);
  additionalKeys.forEach((key) => {
    if (typeof key === 'string' && key.trim()) {
      used.add(key.trim());
    }
  });

  const { vars } = loadEnvFile(envFile);
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


