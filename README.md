## checkmyenv

Scan your project for `process.env.*` usages, compare them with your `.env`, and keep `.env` in sync with `.env.example`.

### Features

- Scan project files for environment variables (`process.env.*` and `process.env['VAR']`).
- Compare with `.env` to find missing, present, and unused variables.
- Output results in a friendly console view or machine-readable JSON.
- Interactive prompts to fill in missing values.
- Generate a new `.env` if it doesn’t exist.
- Sync `.env` with `.env.example`.
- Configure defaults via `checkmyenv.config.*` or `package.json`.
- Install globally and use as a CLI.

### Installation

```bash
npm install -g @eminemah/checkmyenv
```

Requires Node.js >= 18.

### Usage

```bash
# Using npx (recommended)
npx @eminemah/checkmyenv DB_URL API_KEY PORT SECRET_KEY

# Or, if globally installed correctly
checkmyenv DB_URL API_KEY PORT SECRET_KEY

# Show report of missing/unused variables
checkmyenv check

# Create/update .env by prompting for missing values
checkmyenv generate

# Merge .env with .env.example (prompts for any missing values)
checkmyenv sync
```

Options (can also be set in config):

- `-e, --env-file <path>`: Path to `.env` file (default `.env`)
- `-x, --example-file <path>`: Path to `.env.example` (default `.env.example`, sync only)
- `-p, --patterns <globs...>`: File globs to scan (default `**/*.{js,jsx,ts,tsx,mjs,cjs,vue,svelte}`)
- `-i, --ignore <globs...>`: Ignore globs (default `**/node_modules/** **/dist/** **/build/** **/.git/**`)
- `-r, --report <format>`: Report format (`console` or `json`, default `console`)

### Examples

```bash
# Scan a monorepo workspace
checkmyenv check -p "packages/**/*.{ts,tsx}" -i "**/node_modules/**" "**/dist/**"

# Generate .env in a custom path
checkmyenv generate -e ./config/.env

# Sync with a custom example file
checkmyenv sync -e .env -x .env.example

# JSON output for CI or scripts
checkmyenv check --report json > env-report.json
```

### Configuration

Create a `checkmyenv.config.js`, `checkmyenv.config.mjs`, `checkmyenv.config.cjs`, or `checkmyenv.config.json` file (or add a `checkmyenv` field in `package.json`) to set defaults:

```js
// checkmyenv.config.js
export default {
  envFile: './config/.env',
  exampleFile: './config/.env.example',
  patterns: ['src/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
  ignore: ['**/node_modules/**', '**/dist/**'],
  report: 'json',
  additionalKeys: ['NODE_ENV', 'PUBLIC_URL']
};
```

CLI flags always override config values.

### How it works

- Uses glob patterns to find files.
- Regex-detects `process.env.VAR_NAME` and `process.env['VAR_NAME']` occurrences.
- Parses `.env` using `dotenv` and compares the keys to what’s used in code.

### License

MIT


