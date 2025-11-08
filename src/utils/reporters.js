import chalk from 'chalk';

export function outputReport(format, diff, meta) {
  switch (format) {
    case 'json':
      printJson(diff, meta);
      break;
    case 'console':
    default:
      printConsole(diff, meta);
      break;
  }
}

function printConsole(diff, meta) {
  const { usedCount, envFile } = meta;
  console.log(chalk.cyan(`Scanned variables used in code: ${usedCount}`));
  console.log();

  if (diff.missing.length === 0 && diff.unused.length === 0) {
    console.log(chalk.green(`All good! ${envFile} matches variables used in code.`));
    return;
  }

  if (diff.missing.length > 0) {
    console.log(chalk.yellow('Missing in .env (used in code but not set):'));
    for (const key of diff.missing) {
      console.log(`  ${chalk.yellow('•')} ${key}`);
    }
    console.log();
  }

  if (diff.present.length > 0) {
    console.log(chalk.green('Present in both code and .env:'));
    for (const key of diff.present) {
      console.log(`  ${chalk.green('•')} ${key}`);
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

function printJson(diff, meta) {
  const payload = {
    summary: {
      usedCount: meta.usedCount,
      envFile: meta.envFile,
      missingCount: diff.missing.length,
      presentCount: diff.present.length,
      unusedCount: diff.unused.length
    },
    diff
  };
  console.log(JSON.stringify(payload, null, 2));
}


