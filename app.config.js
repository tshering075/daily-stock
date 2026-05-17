const fs = require('fs');
const path = require('path');

const ENV_KEYS = [
  'EXPO_PUBLIC_GOOGLE_SHEETS_URL',
  'EXPO_PUBLIC_GOOGLE_SHEET_VIEW_URL',
];

/** Load EXPO_PUBLIC_* from env files when missing or blank (e.g. Cloudflare has no .env). */
function loadEnvFiles() {
  const files = ['.env', 'deployment.env'];

  for (const key of ENV_KEYS) {
    if (process.env[key]?.trim()) continue;

    for (const file of files) {
      const envPath = path.join(__dirname, file);
      if (!fs.existsSync(envPath)) continue;

      for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        if (trimmed.startsWith(`${key}=`)) {
          const value = trimmed.slice(key.length + 1).trim();
          if (value) {
            process.env[key] = value;
            break;
          }
        }
      }

      if (process.env[key]?.trim()) break;
    }
  }
}

loadEnvFiles();

const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    plugins: [...(appJson.expo.plugins || []), '@react-native-community/datetimepicker'],
  },
};
