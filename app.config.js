const fs = require('fs');
const path = require('path');

const ENV_KEYS_FROM_DOTENV = [
  'EXPO_PUBLIC_GOOGLE_SHEETS_URL',
  'EXPO_PUBLIC_GOOGLE_SHEET_VIEW_URL',
];

/** If the shell has an empty EXPO_PUBLIC_* value, read it from .env. */
function ensureEnvFromDotenv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const key of ENV_KEYS_FROM_DOTENV) {
    if (process.env[key]?.trim()) continue;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      if (trimmed.startsWith(`${key}=`)) {
        process.env[key] = trimmed.slice(key.length + 1).trim();
        break;
      }
    }
  }
}

ensureEnvFromDotenv();

module.exports = require('./app.json');
