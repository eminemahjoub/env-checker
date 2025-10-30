import inquirer from 'inquirer';
import chalk from 'chalk';
import { loadEnvFile, loadExample, mergeWithExample, saveEnvFile } from '../utils/envManager.js';

export async function runSync(options) {
  const envFile = options.envFile || '.env';
  const exampleFile = options.exampleFile || '.env.example';

  const { vars: envVars } = loadEnvFile(envFile);
  const exampleVars = loadExample(exampleFile);

  if (exampleVars.size === 0) {
    console.log(chalk.yellow(`${exampleFile} not found or empty. Nothing to sync.`));
    return;
  }

  const merged = mergeWithExample(exampleVars, envVars);

  const keysMissingValues = [...merged.entries()]
    .filter(([key, value]) => value === '' || value === undefined)
    .map(([key]) => key);

  if (keysMissingValues.length > 0) {
    console.log(chalk.yellow(`Fill values for ${keysMissingValues.length} keys from ${exampleFile}:`));
    const answers = await inquirer.prompt(
      keysMissingValues.map((key) => ({
        type: 'input',
        name: key,
        message: `Value for ${key}:`,
        default: ''
      }))
    );
    for (const key of keysMissingValues) {
      merged.set(key, answers[key] ?? '');
    }
  }

  const savedPath = saveEnvFile(envFile, merged);
  console.log(chalk.cyan(`Synced with ${exampleFile} and saved ${savedPath}`));
}


