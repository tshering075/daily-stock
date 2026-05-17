const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Windows: optional @expo/ngrok platform bins are often missing and crash Metro's watcher (ENOENT).
const ngrokBinExclude = /node_modules[\\/]@expo[\\/]ngrok-bin-/;

config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
      ? [config.resolver.blockList]
      : []),
  ngrokBinExclude,
];

config.watcher = {
  ...config.watcher,
  additionalExcludes: [...(config.watcher?.additionalExcludes ?? []), ngrokBinExclude],
};

module.exports = config;
