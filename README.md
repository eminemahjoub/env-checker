## env-checker

Scan your project for `process.env.*` usages, compare them with your `.env`, and keep `.env` in sync with `.env.example`.

### Features

- Scan project files for environment variables (`process.env.*`).
- Compare with `.env` to find missing and unused variables.
- Interactive prompts to fill in missing values.
- Generate a new `.env` if it doesn’t exist.
- Sync `.env` with `.env.example`.
- Install globally and use as a CLI.

### Installation

```bash
npm install -g env-checker
```

Requires Node.js >= 18.

### Usage

```bash
# Show report of missing/unused variables
env-checker check

# Create/update .env by prompting for missing values
env-checker generate

# Merge .env with .env.example (prompts for any missing values)
env-checker sync
```

Options:

- `-e, --env-file <path>`: Path to `.env` file (default `.env`)
- `-x, --example-file <path>`: Path to `.env.example` (default `.env.example`, sync only)
- `-p, --patterns <globs...>`: File globs to scan (default `**/*.{js,jsx,ts,tsx,mjs,cjs,vue,svelte}`)
- `-i, --ignore <globs...>`: Ignore globs (default `**/node_modules/** **/dist/** **/build/** **/.git/**`)

### Examples

```bash
# Scan a monorepo workspace
env-checker check -p "packages/**/*.{ts,tsx}" -i "**/node_modules/**" "**/dist/**"

# Generate .env in a custom path
env-checker generate -e ./config/.env

# Sync with a custom example file
env-checker sync -e .env -x .env.example
```

### How it works

- Uses glob patterns to find files.
- Regex-detects `process.env.VAR_NAME` occurrences.
- Parses `.env` using `dotenv` and compares the keys to what’s used in code.

### License

MIT


