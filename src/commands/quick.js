import inquirer from 'inquirer';
import chalk from 'chalk';
import { loadEnvFile, saveEnvFile } from '../utils/envManager.js';
import { DEFAULT_ENV_FILE } from '../utils/constants.js';
import { loadConfig } from '../utils/config.js';

export async function runQuickInit(options, keys) {
  const config = await loadConfig();
  const envFile = options.envFile ?? config?.envFile ?? DEFAULT_ENV_FILE;
  const { vars } = loadEnvFile(envFile);

  const targetKeys = Array.from(new Set(keys)).filter(Boolean);
  if (targetKeys.length === 0) {
    console.log(chalk.yellow('No keys provided.'));
    return;
  }

  const missing = targetKeys.filter((k) => !vars.has(k));
  const answers = missing.length
    ? await inquirer.prompt(
        missing.map((key) => ({
          type: 'input',
          name: key,
          message: `Value for ${key}:`,
          default: ''
        }))
      )
    : {};

  const updated = new Map(vars);
  for (const key of targetKeys) {
    if (!updated.has(key)) {
      updated.set(key, answers[key] ?? '');
    }
  }

  const savedPath = saveEnvFile(envFile, updated);
  console.log(chalk.cyan(`Saved ${savedPath}`));
}

